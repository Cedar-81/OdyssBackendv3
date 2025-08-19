import { z } from 'zod';

export const CreatePlaybookSchema = z.object({
  title: z.string(),
  destination: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  overview: z.string(),
  userId: z.string(),
  playbookId: z.string(),
  data: z.object({
    itinerary: z.object({
      title: z.string(),
      itineraries: z.array(
        z.object({
          activities: z.array(
            z.object({
              time: z.string().describe("The time of the activity. Format: HH:MM AM/PM"),
              content: z.string(),
              date: z.string().describe("The date of the activity. Format: YYYY-MM-DD")
            })
          )
        })
      )
    }).optional(),
    
    budget: z.object({
      total: z.number(),
      breakdown: z.object({
        accommodation: z.string(),
        transportation: z.string(),
        food: z.string(),
        experiences: z.string(),
        miscellaneous: z.string()
      })
    }).optional(),
    
    checklist: z.object({ 
      title: z.string(), 
      categories: z.array(z.object({
      category: z.string(),
      items: z.array(z.object({
        task: z.string(),
        completed: z.boolean().default(false)
      })) // Limit items per category
    }))}).optional() // Limit categories
  }).optional()
});

export type CreatePlaybookDto = z.infer<typeof CreatePlaybookSchema>;

