import { AddonData, AddonFile } from "@pepperi-addons/papi-sdk";
import { ChartDTO } from "./models/chart";

export class ChartMap {
  
    public static toDTO (chartFromPFS: AddonFile, chartMetaData: AddonData): ChartDTO {
      return {
        Key: chartFromPFS.Key,
        Name: chartMetaData.Name ?? '',
        Type: chartMetaData.Type,
        ScriptURI: chartFromPFS.URL ?? '',
        Description: chartFromPFS.Description,
        Hidden: chartFromPFS.Hidden,
        System: chartMetaData.System,
        CreationDateTime: chartMetaData.CreationDateTime,
        ModificationDateTime: chartMetaData.ModificationDateTime
      }
    }
  }