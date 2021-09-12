import { Chart, ChartDTO } from "./models/chart";

export class ChartMap {
  
    public static toDTO (chart: Chart): ChartDTO {
      return {
        Key: chart.Key,
        Name: chart.Name,
        ScriptURI: chart.ScriptURI,
        Type: chart.Type,
        Description: chart.Description,
        Hidden: chart.Hidden,
        ReadOnly: chart.ReadOnly,
        CreationDateTime: chart.CreationDateTime,
        ModificationDateTime: chart.ModificationDateTime
      }
    }
  }