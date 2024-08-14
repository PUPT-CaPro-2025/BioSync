export interface Visitor {
    id: number
    visitor_name: string;
    visit: string;
    visit_date: string;
    details?: string;
    event: string;
    destination: string;
    time_in: string;
    time_out: string;
}