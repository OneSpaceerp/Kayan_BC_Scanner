import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createLead, addComment, uploadFile, checkDuplicate, listRecentLeads } from "./leadApi";
import { ENDPOINTS } from "@/shared/api/endpoints";

const BASE = "https://erp.example.com";

function buildMock() {
  const instance = axios.create({ baseURL: BASE });
  const mock = new MockAdapter(instance);
  return { instance, mock };
}

const SAMPLE_PAYLOAD = {
  lead_name: "Ahmed Hassan",
  company_name: "Nile Traders LLC",
  email_id: "ahmed@niletraders.com",
  mobile_no: "+201012345678",
  source: "Campaign" as const,
  campaign_name: "CAMP-001",
  custom_captured_via: "QR" as const,
};

const SAMPLE_LEAD_RECORD = {
  ...SAMPLE_PAYLOAD,
  name: "CRM-LEAD-2026-00001",
  owner: "ahmed@example.com",
  creation: "2026-04-21T10:00:00.000Z",
};

// ─── createLead ───────────────────────────────────────────────────────────────

describe("createLead", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => { ({ instance, mock } = buildMock()); });
  afterEach(() => mock.restore());

  it("returns the created lead record on 200", async () => {
    mock.onPost(ENDPOINTS.leads).reply(200, { data: SAMPLE_LEAD_RECORD });
    const result = await createLead(instance, SAMPLE_PAYLOAD);
    expect(result.name).toBe("CRM-LEAD-2026-00001");
    expect(result.lead_name).toBe("Ahmed Hassan");
    expect(result.owner).toBe("ahmed@example.com");
  });

  it("throws on 401", async () => {
    mock.onPost(ENDPOINTS.leads).reply(401);
    await expect(createLead(instance, SAMPLE_PAYLOAD)).rejects.toThrow();
  });

  it("throws on 403", async () => {
    mock.onPost(ENDPOINTS.leads).reply(403);
    await expect(createLead(instance, SAMPLE_PAYLOAD)).rejects.toThrow();
  });

  it("throws on 500", async () => {
    mock.onPost(ENDPOINTS.leads).reply(500);
    await expect(createLead(instance, SAMPLE_PAYLOAD)).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onPost(ENDPOINTS.leads).networkError();
    await expect(createLead(instance, SAMPLE_PAYLOAD)).rejects.toThrow();
  });
});

// ─── addComment ───────────────────────────────────────────────────────────────

describe("addComment", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => { ({ instance, mock } = buildMock()); });
  afterEach(() => mock.restore());

  it("resolves without error on 200", async () => {
    mock.onPost(ENDPOINTS.addComment).reply(200, { message: {} });
    await expect(
      addComment(instance, {
        reference_name: "CRM-LEAD-2026-00001",
        content: "Interested in ERPNext demo",
        comment_email: "ahmed@example.com",
        comment_by: "Ahmed Hassan",
      })
    ).resolves.toBeUndefined();
  });

  it("throws on 401", async () => {
    mock.onPost(ENDPOINTS.addComment).reply(401);
    await expect(
      addComment(instance, {
        reference_name: "X",
        content: "note",
        comment_email: "a@b.com",
        comment_by: "A",
      })
    ).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onPost(ENDPOINTS.addComment).networkError();
    await expect(
      addComment(instance, {
        reference_name: "X",
        content: "note",
        comment_email: "a@b.com",
        comment_by: "A",
      })
    ).rejects.toThrow();
  });
});

// ─── uploadFile ───────────────────────────────────────────────────────────────

describe("uploadFile", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => { ({ instance, mock } = buildMock()); });
  afterEach(() => mock.restore());

  it("returns file_url and name on 200", async () => {
    mock.onPost(ENDPOINTS.uploadFile).reply(200, {
      message: { file_url: "/files/card.jpg", name: "FILE-001" },
    });
    const result = await uploadFile(
      instance,
      "CRM-LEAD-2026-00001",
      new Blob(["img"], { type: "image/jpeg" })
    );
    expect(result.file_url).toBe("/files/card.jpg");
    expect(result.name).toBe("FILE-001");
  });

  it("throws on 401", async () => {
    mock.onPost(ENDPOINTS.uploadFile).reply(401);
    await expect(
      uploadFile(instance, "LEAD-1", new Blob(["x"]))
    ).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onPost(ENDPOINTS.uploadFile).networkError();
    await expect(
      uploadFile(instance, "LEAD-1", new Blob(["x"]))
    ).rejects.toThrow();
  });
});

// ─── checkDuplicate ───────────────────────────────────────────────────────────

describe("checkDuplicate", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => { ({ instance, mock } = buildMock()); });
  afterEach(() => mock.restore());

  it("returns null when no duplicate exists", async () => {
    mock.onGet(ENDPOINTS.leads).reply(200, { data: [] });
    const result = await checkDuplicate(instance, "CAMP-001", "new@example.com");
    expect(result).toBeNull();
  });

  it("returns the lead record when a duplicate is found", async () => {
    mock.onGet(ENDPOINTS.leads).reply(200, {
      data: [{ name: "CRM-LEAD-2026-00001", lead_name: "Ahmed Hassan" }],
    });
    const result = await checkDuplicate(instance, "CAMP-001", "ahmed@niletraders.com");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("CRM-LEAD-2026-00001");
  });

  it("throws on 401", async () => {
    mock.onGet(ENDPOINTS.leads).reply(401);
    await expect(
      checkDuplicate(instance, "CAMP-001", "a@b.com")
    ).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onGet(ENDPOINTS.leads).networkError();
    await expect(
      checkDuplicate(instance, "CAMP-001", "a@b.com")
    ).rejects.toThrow();
  });
});

// ─── listRecentLeads ──────────────────────────────────────────────────────────

describe("listRecentLeads", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => { ({ instance, mock } = buildMock()); });
  afterEach(() => mock.restore());

  it("returns an array of leads on 200", async () => {
    mock.onGet(ENDPOINTS.leads).reply(200, { data: [SAMPLE_LEAD_RECORD] });
    const results = await listRecentLeads(instance, "CAMP-001");
    expect(results).toHaveLength(1);
    expect(results[0].lead_name).toBe("Ahmed Hassan");
  });

  it("returns empty array when campaign has no leads", async () => {
    mock.onGet(ENDPOINTS.leads).reply(200, { data: [] });
    const results = await listRecentLeads(instance, "CAMP-001");
    expect(results).toEqual([]);
  });

  it("throws on 401", async () => {
    mock.onGet(ENDPOINTS.leads).reply(401);
    await expect(listRecentLeads(instance, "CAMP-001")).rejects.toThrow();
  });

  it("throws on 500", async () => {
    mock.onGet(ENDPOINTS.leads).reply(500);
    await expect(listRecentLeads(instance, "CAMP-001")).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onGet(ENDPOINTS.leads).networkError();
    await expect(listRecentLeads(instance, "CAMP-001")).rejects.toThrow();
  });
});
