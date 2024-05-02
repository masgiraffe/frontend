export interface DateInfo {
  year: number | undefined;
  month: number | undefined;
  day: number | undefined;
}

export interface Equipment {
  id: number;
  name: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  dateInstalled: DateInfo;
  lastMaintenanceDate: DateInfo;
}
