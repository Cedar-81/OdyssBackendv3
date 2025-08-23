import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  supabaseUser: {
    id: string;
    [key: string]: any;
  };
}
