import { AddonData, AddonFile } from "@pepperi-addons/papi-sdk";
import { ChartDTO } from "./models/chart";

export class ChartMap {
  
    public static toDTO (chartFromPFS: AddonFile, chartMetaData: AddonData): ChartDTO {
      return {
        Key: chartFromPFS.Key,
        Name: chartFromPFS.Name?.substring(0,chartFromPFS.Name.length-3) ?? '',
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