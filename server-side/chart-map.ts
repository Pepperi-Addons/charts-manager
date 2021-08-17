import { Chart, ChartDTO } from "./models/chart";

export class ChartMap {
  
    public static toDTO (chart: Chart): ChartDTO {
      return {
        Name: chart.Name,
        ScriptURL: chart.ScriptURL,
        Type: chart.Type,
        Description: chart.Description,
        Hidden: chart.Hidden,
        ReadOnly: chart.ReadOnly,
        CreationDateTime: chart.CreationDateTime,
        ModificationDateTime: chart.ModificationDateTime
      }
    }
  }