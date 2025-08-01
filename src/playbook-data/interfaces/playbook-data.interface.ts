export interface PlaybookData {
  itinerary: {
    title: string;
    activities: {
      time: string;
      content: string;
    }[];
  };
  transportation: {
    tickets: any[];
  };
  accommodation: {
    tickets: any[];
  };
  budget: {
    totalBudget: number;
    breakdown: Record<string, number>;
  };
  checklist: {
    groups: {
      title: string;
      items: {
        content: string;
        checked: boolean;
      }[];
    }[];
  };
  activities: {
    food: any[];
    transport: any[];
    events: any[];
  };
}
