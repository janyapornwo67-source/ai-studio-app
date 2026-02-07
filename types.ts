
export type ToneType = 
  | 'professional' 
  | 'polite' 
  | 'casual' 
  | 'friendly' 
  | 'persuasive' 
  | 'humorous' 
  | 'urgent';

export interface ToneOption {
  id: ToneType;
  label: string;
  icon: string;
  description: string;
}

export interface AdjustmentResult {
  original: string;
  scenario?: string;
  adjusted: string;
  tone: ToneType;
}
