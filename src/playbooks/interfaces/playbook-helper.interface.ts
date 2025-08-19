import * as Y from 'yjs';
import { CreatePlaybookDto } from '../dto/create-playbook.dto';


// Create a Yjs doc with defaults, merging any DTO values provided
export function createPlaybookDocFromDto(dto?: CreatePlaybookDto) {
  const ydoc = new Y.Doc();
  const root = ydoc.getMap();

  // Root fields
  root.set('title', dto?.title ?? '');
  root.set('destination', dto?.destination ?? '');
  root.set('start_date', dto?.start_date ?? '');
  root.set('end_date', dto?.end_date ?? '');
  root.set('overview', dto?.overview ?? '');
  root.set('userId', dto?.userId ?? '');

  // Only create data object if dto.data exists
  if (dto?.data) {
    const dataMap = new Y.Map();
    root.set('data', dataMap);

    // itinerary - only if exists
    if (dto.data.itinerary) {
      const itineraryMap = new Y.Map();
      itineraryMap.set('title', dto.data.itinerary.title);
      
      const itinerariesArray = new Y.Array();
      (dto.data.itinerary.itineraries ?? []).forEach(itinerary => {
        const itineraryItemMap = new Y.Map();
        const activitiesArray = new Y.Array();
        
        (itinerary.activities ?? []).forEach(activity => {
          const activityMap = new Y.Map();
          activityMap.set('time', activity.time);
          activityMap.set('content', activity.content);
          activityMap.set('date', activity.date);
          activitiesArray.push([activityMap]);
        });
        
        itineraryItemMap.set('activities', activitiesArray);
        itinerariesArray.push([itineraryItemMap]);
      });
      
      itineraryMap.set('itineraries', itinerariesArray);
      dataMap.set('itinerary', itineraryMap);
    }

    // budget - only if exists
    if (dto.data.budget) {
      const budgetMap = new Y.Map();
      
      if (dto.data.budget.total !== undefined) {
        budgetMap.set('total', dto.data.budget.total);
      }
      
      if (dto.data.budget.breakdown) {
        const breakdownMap = new Y.Map();
        Object.entries(dto.data.budget.breakdown).forEach(([k, v]) => {
          breakdownMap.set(k, v);
        });
        budgetMap.set('breakdown', breakdownMap);
      }
      
      dataMap.set('budget', budgetMap);
    }

    // checklist - only if exists (updated structure)
    if (dto.data.checklist) {
      const checklistMap = new Y.Map();
      checklistMap.set('title', dto.data.checklist.title);
      
      const categoriesArray = new Y.Array();
      (dto.data.checklist.categories ?? []).forEach(category => {
        const categoryMap = new Y.Map();
        categoryMap.set('category', category.category);
        
        const itemsArray = new Y.Array();
        (category.items ?? []).forEach(item => {
          const itemMap = new Y.Map();
          itemMap.set('task', item.task);
          itemMap.set('completed', item.completed ?? false);
          itemsArray.push([itemMap]);
        });
        categoryMap.set('items', itemsArray);
        
        categoriesArray.push([categoryMap]);
      });
      
      checklistMap.set('categories', categoriesArray);
      dataMap.set('checklist', checklistMap);
    }
  }

  return ydoc;
}

// Function to convert encoded fileData to Y.Doc
export function decodeFileDataToYDoc(fileData: any): Y.Doc {
  const ydoc = new Y.Doc();
  
  try {
    let uint8Data: Uint8Array;
    
    // Handle the specific Supabase format: PostgreSQL bytea containing JSON Buffer
    if (typeof fileData === 'string' && fileData.startsWith('\\x')) {
      // Step 1: Convert PostgreSQL bytea (\\x...) to binary string
      const hexString = fileData.substring(2); // Remove \\x prefix
      let binaryString = '';
      for (let i = 0; i < hexString.length; i += 2) {
        binaryString += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
      }
      
      // Step 2: Parse the JSON Buffer format
      const bufferJson = JSON.parse(binaryString);
      if (bufferJson.type === 'Buffer' && Array.isArray(bufferJson.data)) {
        uint8Data = new Uint8Array(bufferJson.data);
      } else {
        throw new Error('Unexpected JSON format in fileData');
      }
    }
    // Handle other formats as fallbacks
    else if (fileData instanceof Uint8Array) {
      uint8Data = fileData;
    } else if (Buffer.isBuffer(fileData)) {
      uint8Data = new Uint8Array(fileData);
    } else {
      throw new Error(`Unsupported fileData format: ${typeof fileData}`);
    }
    
    // Apply the Y.js update
    Y.applyUpdate(ydoc, uint8Data);
    return ydoc;
    
  } catch (error) {
    console.error('Error decoding fileData to Y.Doc:', error);
    throw new Error(`Failed to decode Y.js data: ${error.message}`);
  }
}


function yTypeToJSON(type: any): any {
  if (type instanceof Y.Map) {
    const obj: Record<string, any> = {};
    type.forEach((val, key) => {
      obj[key] = yTypeToJSON(val);
    });
    return obj;
  }

  if (type instanceof Y.Array) {
    return type.map((val) => yTypeToJSON(val));
  }

  if (type instanceof Y.Text) {
    return type.toString();
  }

  // Primitive (string, number, boolean, null, etc.)
  return type;
}

export function yDocToJSON(doc: Y.Doc) {
  // Assuming your root is a Y.Map
  const root = doc.getMap(); // 👈 this is the "top-level"
  return yTypeToJSON(root);
}