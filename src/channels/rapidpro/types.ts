'use strict';

/**
 * A Request body for data to be sent to RapidPro.
 */
export interface RapidProFlowBody {
  flow: string;
  urns: string[];
  extra: {
    message: string;
  };
}

/**
 * A response from RapidPro flow start trigger.
 */
export interface SendResponse {
  id: number;
  uuid: string;
  status: string;
  created_on: Date;
  modified_on: Date;
}
