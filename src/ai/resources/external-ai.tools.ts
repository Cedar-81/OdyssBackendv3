// tools using APIs from external sources like booking.com etc
import { Injectable } from '@nestjs/common';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { DateTime } from 'luxon';
import RSSParser from 'rss-parser';

// ---- 1) Current Date/Time Tool ----
const CurrentDateTimeSchema = z.object({
  format: z
    .enum(["iso", "readable", "all"]).default("all")
    .describe("Which format to return: iso, readable, or all"),
});

@Injectable()
export class GetCurrentDateTimeTool extends StructuredTool {
  name = 'get_current_datetime';
  description = 'Return the current date/time in Africa/Lagos and UTC, plus friendly formats for itineraries.';
  schema = CurrentDateTimeSchema;

  private readonly AFRICA_LAGOS_TZ = "Africa/Lagos";

  async _call(args: z.infer<typeof CurrentDateTimeSchema>, runManager?: any): Promise<string> {
    const { format } = args;
    
    const nowUtc = DateTime.utc();
    const nowNg = nowUtc.setZone(this.AFRICA_LAGOS_TZ);
    
    const payload = {
      utc: {
        iso: nowUtc.toISO(),
        readable: nowUtc.toFormat("ccc, dd LLL yyyy • HH:mm 'UTC'"),
        epochMs: nowUtc.toMillis(),
      },
      africa_lagos: {
        iso: nowNg.toISO(),
        readable: nowNg.toFormat("ccc, dd LLL yyyy • hh:mm a 'WAT'"),
        epochMs: nowNg.toMillis(),
      },
    };

    if (format === "iso") {
      return JSON.stringify({ 
        utc: payload.utc.iso, 
        africa_lagos: payload.africa_lagos.iso 
      });
    }
    
    if (format === "readable") {
      return JSON.stringify({ 
        utc: payload.utc.readable, 
        africa_lagos: payload.africa_lagos.readable 
      });
    }
    
    return JSON.stringify(payload);
  }
}

// ---- 2) Tourism Sites Tool ----
const TourismSitesSchema = z.object({
  location: z.string().describe("City/region/country, e.g. 'Enugu', 'Calabar', 'Obudu, Cross River', 'Nigeria'."),
  maxResults: z.number().int().min(1).max(25).default(15),
});

@Injectable()
export class TourismSitesTool extends StructuredTool {
  name = 'tourism_sites';
  description = 'List notable tourism sites for a given city/region in Nigeria/Africa using Wikivoyage/Wikipedia, with hints if on-site lodging is mentioned.';
  schema = TourismSitesSchema;

  async _call(args: z.infer<typeof TourismSitesSchema>, runManager?: any): Promise<string> {
    const { location, maxResults } = args;
    
    try {
      const endpoint = "https://en.wikivoyage.org/w/api.php";
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "extracts|pageimages|coordinates",
        generator: "search",
        exintro: "",
        explaintext: "",
        gsrsearch: location,
        gsrlimit: String(maxResults),
        pithumbsize: "320",
        origin: "*",
      });

      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error(`Wikivoyage fetch failed: ${res.status}`);
      
      const data = await res.json();
      const pages = Object.values<any>(data.query?.pages || {});
      
      const items = pages.map((p) => {
        const text: string = p.extract || "";
        const hasLodging = /hotel|lodge|resort|accommodation|guesthouse|hostel/i.test(text);
        return {
          pageid: p.pageid,
          title: p.title,
          summary: text.slice(0, 500),
          hasAccommodationMention: hasLodging,
          thumb: p.thumbnail?.source,
          coord: p.coordinates?.[0] ? { 
            lat: p.coordinates[0].lat, 
            lon: p.coordinates[0].lon 
          } : undefined,
        };
      });

      return JSON.stringify({ count: items.length, items });
    } catch (error) {
      console.error("Error in TourismSitesTool:", error);
      return JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to fetch tourism sites"
      });
    }
  }
}

// ---- 3) Travel Blogs Tool ----
const TravelBlogsSchema = z.object({
  feeds: z.array(z.string().url()).optional().describe("List of RSS/Atom feed URLs to aggregate."),
  maxItemsPerFeed: z.number().int().min(1).max(30).default(10),
});

@Injectable()
export class TravelBlogsTool extends StructuredTool {
  name = 'travel_blogs_feed';
  description = 'Fetch recent travel blog/news posts focused on Africa/Nigeria via RSS. Returns title, link, published date, and summary.';
  schema = TravelBlogsSchema;

  private readonly DEFAULT_FEEDS = [
    "https://www.travelnoire.com/feed/",
    "https://blog.travelstart.com/blog/feed/",
    "https://nomadafricamag.com/feed/",
    "https://wanderlust.co.uk/rss/",
    "https://africageographic.com/feed/",
  ];

  async _call(args: z.infer<typeof TravelBlogsSchema>, runManager?: any): Promise<string> {
    const { feeds, maxItemsPerFeed } = args;
    
    try {
      const parser = new RSSParser({ timeout: 15000 });
      const sources = feeds && feeds.length ? feeds : this.DEFAULT_FEEDS;
      const results: any[] = [];

      for (const url of sources) {
        try {
          const feed = await parser.parseURL(url);
          for (const item of feed.items.slice(0, maxItemsPerFeed)) {
            results.push({
              source: feed.title,
              title: item.title,
              link: item.link,
              isoDate: item.isoDate || item.pubDate,
              summary: item.contentSnippet?.slice(0, 240),
            });
          }
        } catch (e) {
          results.push({ source: url, error: String(e) });
        }
      }

      // Sort newest first when isoDate exists
      results.sort((a, b) => (new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime()));
      
      return JSON.stringify({ count: results.length, items: results });
    } catch (error) {
      console.error("Error in TravelBlogsTool:", error);
      return JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to fetch travel blogs"
      });
    }
  }
}

// ---- 4) Geo Web Search Tool (without API requirement) ----
const GeoWebSearchSchema = z.object({
  query: z.string().describe("Search query, e.g., 'visa on arrival Nigeria ECOWAS', 'Calabar carnival 2025 dates'."),
  regionHint: z.string().optional().describe("Country/region hint like 'Nigeria', 'West Africa'."),
  maxResults: z.number().int().min(1).max(10).default(5),
});

@Injectable()
export class GeoWebSearchTool extends StructuredTool {
  name = 'geo_web_search';
  description = 'General web search with a Nigeria/Africa bias. Use for events, advisories, visa rules, festival dates, etc. Returns top links + snippets.';
  schema = GeoWebSearchSchema;

  async _call(args: z.infer<typeof GeoWebSearchSchema>, runManager?: any): Promise<string> {
    const { query, regionHint, maxResults } = args;
    
    // Check if SERP_API_KEY is available
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      return JSON.stringify({
        note: "No SERP_API_KEY configured. Provide one to enable geo_web_search.",
        query,
        regionHint,
        message: "Web search functionality requires API key configuration"
      });
    }

    try {
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("engine", "google");
      url.searchParams.set("q", query + (regionHint ? ` ${regionHint}` : ""));
      url.searchParams.set("num", String(Math.min(maxResults, 10)));
      url.searchParams.set("api_key", apiKey);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`SERP search failed: ${res.status}`);
      
      const data = await res.json();
      const items = (data.organic_results || []).slice(0, maxResults).map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        source: r.source,
      }));

      return JSON.stringify({ count: items.length, items });
    } catch (error) {
      console.error("Error in GeoWebSearchTool:", error);
      return JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to perform web search"
      });
    }
  }
}