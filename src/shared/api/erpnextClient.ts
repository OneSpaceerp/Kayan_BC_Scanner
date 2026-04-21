// ERPNext Axios client — Milestone 3
import axios from "axios";

export const createErpClient = (baseURL: string, apiKey: string, apiSecret: string) =>
  axios.create({
    baseURL,
    headers: {
      Authorization: `token ${apiKey}:${apiSecret}`,
      Accept: "application/json",
    },
  });

export const anonErpClient = (baseURL: string) =>
  axios.create({ baseURL, headers: { Accept: "application/json" } });
