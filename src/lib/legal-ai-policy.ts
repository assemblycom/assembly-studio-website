import type { LegalDocument } from "@/components/legal/legal-document";

// Migrated from assembly.com/legal/ai-policy. This is legal copy: edit
// the wording only when Legal changes it, and bump `lastUpdated` when they do.
// `**…**` marks the emphasis the source page carries, and links to Assembly’s
// other legal pages point at this site’s own copies of them.
export const AI_POLICY: LegalDocument = {
  title: "AI Policy",
  subtitle: "Assembly AI Privacy Policy & Data Handling",
  lastUpdated: "08/07/2026",
  intro: [
    { type: "p", text: "This page explains how Assembly handles workspace data when you use Assembly's AI capabilities. It is a companion to the Assembly Privacy Policy and the Assembly Terms, and it is referenced from Section 18 of the Privacy Policy. Where this page and the Privacy Policy say different things on the same topic, the Privacy Policy controls." },
    { type: "p", text: "We will update this page as functionality changes. Changes that affect the Privacy Policy will be reflected there (as described in Section 20 of the Privacy Policy)." },
  ],
  parts: [
    {
      id: "overview",
      title: null,
      sections: [
        {
          id: "overview-what-this-page-covers",
          heading: "What this page covers",
          blocks: [
            { type: "p", text: "Assembly currently offers the following AI capabilities. They have **different data-handling models** and are described separately below." },
            {
              type: "list",
              items: [
                "**Assembly Assistant** — Assembly's in-product AI capability for tasks such as summarization, drafting, and similar features. For Assembly Assistant, **OpenAI acts as Assembly's Service Provider** under Assembly's contract. Assembly may engage additional AI Service Providers in the future and will update this page and its sub-processor list before doing so.",
                "**Third-Party AI Assistant Connections via MCP** — connections that a workspace administrator or teammate establishes from a third-party AI assistant (such as ChatGPT or Claude) to their workspace, using Assembly's Model Context Protocol (\"MCP\") server. For these connections, **the third-party AI provider is an independent third party that the customer has chosen** — not Assembly's Service Provider.",
                "**Assembly's AI app builder** — A workspace administrator describes an app in natural language and Assembly plans, generates, and installs a working custom app in the workspace. Uses **several AI and infrastructure Service Providers** under Assembly's contracts (Anthropic, OpenAI, Vercel, Neon, Nango), to produce and host apps.",
              ],
            },
          ],
        },
        {
          id: "overview-what-assembly-does-not-do",
          heading: "What Assembly does not do",
          blocks: [
            { type: "p", text: "For Assembly's in-product AI features and MCP connections, Assembly does **not**:" },
            {
              type: "list",
              items: [
                "Use prompts, inputs, outputs, tool calls, or tool responses to train, fine-tune, or improve any AI model — whether Assembly's or any third-party AI provider's.",
                "Sell, or \"share\" (as that term is used under the California Privacy Rights Act, including for cross-context behavioral advertising), any data processed through these capabilities.",
                "Use this data for advertising, marketing, or any purpose other than operating, securing, and debugging Assembly.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "part-1-assembly-assistant",
      title: "Part 1 — Assembly Assistant",
      sections: [
        {
          id: "part-1-assembly-assistant-how-it-works",
          heading: "How it works",
          blocks: [
            { type: "p", text: "When you use Assembly Assistant, Assembly sends the prompt and the workspace data needed to answer it (for example, the message thread you asked to summarize) to OpenAI. OpenAI generates the response and returns it to Assembly, which surfaces it back to you in the Assistant." },
          ],
        },
        {
          id: "part-1-assembly-assistant-openai-as-service-provider",
          heading: "OpenAI as Service Provider",
          blocks: [
            { type: "p", text: "OpenAI processes data for Assembly Assistant as **Assembly's Service Provider**, under Assembly's contract and data-processing agreement with OpenAI. That contract commits both Assembly and OpenAI not to use Assembly Assistant inputs or outputs to train AI models." },
          ],
        },
        {
          id: "part-1-assembly-assistant-what-assembly-does-with-this-data",
          heading: "What Assembly does with this data",
          blocks: [
            {
              type: "list",
              items: [
                "Sends the prompt and the relevant workspace data to OpenAI to generate the response;",
                "Returns the response to the User who requested it;",
                "Records minimal operational telemetry (request metadata, latency, error counters) to operate, secure, and debug the feature.",
              ],
            },
          ],
        },
        {
          id: "part-1-assembly-assistant-retention",
          heading: "Retention",
          blocks: [
            {
              type: "list",
              items: [
                "Inputs and outputs are processed transiently to generate the response. They are not retained by Assembly or OpenAI for training or product-development purposes.",
                "Operational telemetry is retained in line with Assembly's general log-retention practices, described in Section 6 (Retention of Data) of the Privacy Policy.",
              ],
            },
          ],
        },
        {
          id: "part-1-assembly-assistant-permissions",
          heading: "Permissions",
          blocks: [
            { type: "p", text: "A User invoking Assembly Assistant inherits their existing in-product permissions. Assembly Assistant cannot read or modify data that the User could not access directly through Assembly." },
          ],
        },
        {
          id: "part-1-assembly-assistant-controls",
          heading: "Controls",
          blocks: [
            { type: "p", text: "Where Assembly Assistant includes user-level or workspace-level toggles, those are described in the in-product settings. Customers who do not wish to use Assembly Assistant can decline to enable it." },
          ],
        },
      ],
    },
    {
      id: "part-2-third-party-ai-assistant-connections-via-mcp",
      title: "Part 2 — Third-Party AI Assistant Connections via MCP",
      shortTitle: "Part 2 — MCP Connections",
      sections: [
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-what-the-mcp-is",
          heading: "What the MCP is",
          blocks: [
            { type: "p", text: "Assembly's MCP server is an authenticated gateway. It lets a third-party AI assistant — such as ChatGPT or Claude — act on a connected Assembly workspace **on behalf of the workspace User who connected it**. The MCP server exposes a curated set of tools that map one-to-one to functionality already available through Assembly's existing Platform API." },
            { type: "p", text: "**MCP does not introduce new categories of data.** It provides a different way to reach data that is already in the workspace, subject to the connecting User's existing in-product permissions." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-who-can-connect",
          heading: "Who can connect",
          blocks: [
            { type: "p", text: "Only **internal administrator users** of a workspace can establish an MCP connection. **Client-portal end-users and internal Staff role users cannot connect AI assistants.**" },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-how-a-connection-is-authenticated",
          heading: "How a connection is authenticated",
          blocks: [
            {
              type: "list",
              items: [
                "OAuth 2.0 authorization-code flow;",
                "Sign-in by email and password or Google SSO, with optional TOTP multi-factor authentication;",
                "Short-lived access tokens (~1 hour) and long-lived refresh tokens are issued to the AI assistant;",
                "Refresh tokens are encrypted at rest;",
                "Access tokens are not stored on Assembly's servers after issuance;",
                "All MCP traffic is transmitted over TLS.",
              ],
            },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-the-three-parties-involved",
          heading: "The three parties involved",
          blocks: [
            { type: "p", text: "Three separate parties are involved in any MCP request:" },
            {
              type: "list",
              items: [
                "**The customer organization** (and the connecting User) decides whether to connect an AI assistant, which one, and what to ask it to do.",
                "**Assembly** authenticates the connection, routes the AI assistant's tool calls to the Platform API on the connecting User's behalf, and returns responses.",
                "**The third-party AI provider** (for example, OpenAI or Anthropic) decides — under its own privacy policy and the terms of the customer's account with that provider — what to do with prompts, tool inputs, tool responses, and outputs after they leave Assembly's servers, including any logging, retention, training, human review, or onward sharing.",
              ],
            },
            { type: "p", text: "The third-party AI provider is an **independent third party that the customer has chosen**. It is not Assembly's Service Provider or sub-processor. Assembly does not select the AI assistant on the customer's behalf and does not have a contractual relationship with the AI provider on the customer's behalf." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-what-assembly-does-with-mcp-traffic",
          heading: "What Assembly does with MCP traffic",
          blocks: [
            { type: "p", text: "Assembly:" },
            {
              type: "list",
              items: [
                "Authenticates the connecting User and resolves the User's workspace and module access;",
                "Executes each tool call by proxying it to Assembly's Platform API, applying the connecting User's existing permissions;",
                "Returns the tool response to the AI assistant over TLS;",
                "Operates, secures, monitors, and debugs the service. This includes operational telemetry such as request metadata, error counters, abuse signals, and the **arguments the AI assistant supplies to a tool call** (including any rationale the AI provides), which Assembly may retain to understand and debug the requests made through the integration.",
              ],
            },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-what-assembly-does-not-return-through-mcp",
          heading: "What Assembly does not return through MCP",
          blocks: [
            { type: "p", text: "The MCP server does not return Assembly's internal credentials, infrastructure metadata, audit internals, or service logs. Errors are surfaced as the Platform API's standard JSON envelope (status code and human-readable message) — never as stack traces, debug payloads, or raw logs." },
            { type: "p", text: "Resource IDs returned through MCP are the **public Platform API IDs** documented at docs.assembly.com/reference — the same IDs a third-party API integration would receive." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-permissions-and-scope",
          heading: "Permissions and scope",
          blocks: [
            { type: "p", text: "A connected AI assistant inherits the connecting User's existing in-product permissions — no more, no less. If the connecting User cannot see a record in the dashboard, the AI assistant cannot see it through MCP either." },
            { type: "p", text: "The MCP server is **module-gated**: tool families only appear if the workspace has enabled the corresponding module (such as Payments, Contracts, Files, Forms, Messages, or Tasks). Disabled modules' data is not exposed." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-tool-level-scopes-roadmap",
          heading: "Tool-level scopes (roadmap)",
          blocks: [
            { type: "p", text: "Today, the MCP server **does not expose tool-level scopes**. A connected AI assistant has the same breadth of access as the connecting User. Tool-level scoping may be added in a future release. In the meantime, customers who want narrower access should restrict who may connect AI assistants, or connect using a service account whose in-product permissions are deliberately limited." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-audit-log-upcoming",
          heading: "Audit log (upcoming)",
          blocks: [
            { type: "p", text: "MCP tool calls will soon be surfaced to **workspace administrators in Assembly's upcoming in-product audit log**, alongside other Platform API activity. The audit log will show, at minimum, which User initiated the connection, which tools were called, and when. Administrators can use the audit log to monitor AI assistant activity within the workspace." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-categories-of-data-accessible-via-mcp",
          heading: "Categories of data accessible via MCP",
          blocks: [
            { type: "p", text: "Subject to the connecting User's permissions and the customer's enabled modules, an AI assistant connected via MCP may access the following categories of workspace data, each of which can contain Personal Data:" },
            {
              type: "list",
              items: [
                "Workspace metadata;",
                "Client records and company records;",
                "Messages (free-text; may contain Personal Data);",
                "Files (metadata, plus file bytes when explicitly requested by a tool call);",
                "Forms and form responses (free-text; may contain Personal Data);",
                "Financial records, including invoices, subscriptions, payments, products, and prices;",
                "Contracts and signing status;",
                "Tasks, comments, and notes (free-text; may contain Personal Data);",
                "Notifications;",
                "Internal directory information (employee data).",
              ],
            },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-retention",
          heading: "Retention",
          blocks: [
            { type: "p", text: "In addition to the general retention principles described in Section 6 of the Privacy Policy, the following retention periods apply to MCP:" },
            {
              type: "list",
              items: [
                "**OAuth access token:** approximately 1 hour; not stored on Assembly's servers after issuance;",
                "**OAuth refresh token:** stored, encrypted at rest, until revoked by the User or by Assembly;",
                "**MCP connection record:** auto-deleted after approximately 48 hours of inactivity, or earlier on User revocation;",
                "**MCP tool-call telemetry, including tool arguments and rationale:** retained per Assembly's log-retention practices;",
                "**MCP tool-result content:** not written to service logs in plaintext;",
                "**In-product audit log (admin-visible, upcoming tool):** retained per Assembly's audit-log retention practices;",
                "**Underlying workspace data accessed by tools:** governed by the customer's existing retention configuration for Assembly.",
              ],
            },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-customer-responsibilities",
          heading: "Customer responsibilities",
          blocks: [
            { type: "p", text: "By enabling an MCP connection, the customer directs Assembly to share workspace data with the third-party AI assistant in response to its tool calls. **The customer is responsible for:**" },
            {
              type: "list",
              items: [
                "Choosing the AI assistant and reviewing its privacy policy, terms of service, data-processing addendum, and security posture before connecting;",
                "Ensuring it has a lawful basis (and, where required, a separate data-processing agreement directly with the AI provider) for the personal data the AI assistant will receive;",
                "Restricting which of its internal Users may connect AI assistants;",
                "The AI provider's processing of any prompts, tool inputs, tool responses, and outputs **after they leave Assembly**, including any logging, retention, training, human review, or onward sharing the AI provider performs under its own terms;",
                "Communicating to its own clients and end-users (where required by applicable law) that it has enabled an AI integration that may process their personal data;",
                "Disconnecting the AI assistant if it no longer wants the AI assistant to have access.",
              ],
            },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-disconnecting",
          heading: "Disconnecting",
          blocks: [
            { type: "p", text: "A connecting User can manage active MCP connections at any time:" },
            {
              type: "list",
              items: [
                "Go to **Settings → Account → scroll to Connected apps**. The account page lists every active MCP connection on the User's account, along with the connection date.",
                "Click **Revoke** to disconnect. Revocation invalidates the refresh token and prevents further tool calls. Outstanding short-lived access tokens expire within approximately one hour.",
              ],
            },
            { type: "p", text: "**Revocation does not retroactively delete or recall any data the AI provider has already received** during the life of the connection. That data is held by the AI provider under its own retention rules. To request deletion of data already held by the AI provider, the customer must contact that provider directly." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-international-data-transfers",
          heading: "International data transfers",
          blocks: [
            { type: "p", text: "Assembly is hosted on AWS infrastructure in the United States. Where personal data is transferred internationally to or by Assembly, Assembly relies on the transfer mechanisms described in Section 7 of the Privacy Policy." },
            { type: "p", text: "**Transfers from Assembly to a third-party AI provider as a result of an MCP tool call are made on the customer's instruction.** The customer is responsible for the lawful basis and transfer mechanism applicable to its disclosure to the AI provider." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-distribution-status",
          heading: "Distribution status",
          blocks: [
            { type: "p", text: "The MCP server is currently available in developer-mode beta inside ChatGPT, Claude, and Cursor (custom connector flows). Beta status will be removed from this page when the capability moves to general availability." },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-service-providers-used-to-operate-assembly-assistant-and-mcp",
          heading: "Service Providers used to operate Assembly Assistant and MCP",
          blocks: [
            { type: "p", text: "In addition to the Service Providers described in Section 12 of the Privacy Policy and our Subprocessors listed in our Trust Center, the following Service Providers support Assembly's AI capabilities. Their use is governed by Assembly's agreements with them and by their own privacy practices:" },
            {
              type: "list",
              items: [
                "**Amazon Web Services (United States):** provides cloud infrastructure for authentication, compute, storage, and encryption;",
                "**OpenAI (United States):** Service Provider for Assembly Assistant only. OpenAI is **not** Assembly's Service Provider for MCP connections; if you connect ChatGPT via MCP, OpenAI processes that data under your account with OpenAI, not under Assembly's contract.",
              ],
            },
          ],
        },
        {
          id: "part-2-third-party-ai-assistant-connections-via-mcp-data-subject-requests",
          heading: "Data subject requests",
          blocks: [
            { type: "p", text: "Requests to access, correct, or delete personal data that Assembly holds about you continue to be handled as described in Section 10 (GDPR rights) and Section 11 (CCPA rights) of the Privacy Policy." },
            { type: "p", text: "For requests relating to data already held by a connected third-party AI provider, please contact that provider directly using the contact details in its privacy policy. Assembly cannot recall or delete data from another company's systems." },
          ],
        },
      ],
    },
    {
      id: "part-3-ai-app-builder",
      title: "Part 3 — AI App Builder",
      sections: [
        {
          id: "part-3-ai-app-builder-how-it-works",
          heading: "How it works",
          blocks: [
            { type: "p", text: "An administrator describes an app idea in plain language — for example, \"an app that tracks time\" — and Assembly generates a working web application, deploys it, and installs it into the workspace as a custom app." },
            { type: "p", text: "The app builder **produces a durable software artifact**. The prompt, conversations, generated application code, deployment, and installed app record all persist after the session ends, because the resulting app is meant to keep running." },
          ],
        },
        {
          id: "part-3-ai-app-builder-who-can-use-it",
          heading: "Who can use it",
          blocks: [
            { type: "p", text: "The app builder is **administrator-only**. Creating, modifying, deploying, or deleting apps requires workspace administrator privileges, enforced both in the interface and on Assembly's servers. Client-portal end-users cannot access the builder." },
            { type: "p", text: "Once an app is built and installed, the app itself is visible to internal users of the workspace, and may be visible to any number of client users if the administrator configures it that way." },
            { type: "p", text: "The generated app **runs on the Service Provider's infrastructure**, not on Assembly's, and is displayed inside the Assembly interface in an embedded frame." },
          ],
        },
        {
          id: "part-3-ai-app-builder-ai-and-infrastructure-service-providers",
          heading: "AI and infrastructure Service Providers",
          blocks: [
            { type: "p", text: "The app builder uses the following Service Providers from Assembly’s subprocessors list." },
            {
              type: "list",
              items: [
                "**Vercel** — provides the hosting platform the finished app is deployed to and the isolated build environments used by the builder’s preview sandbox.",
                "**Neon** — provides the optional per-app database.",
                "**Nango** — provides optional 3rd party connections.",
                "**OpenAI** — generates app names, descriptions, and icons, and powers the optional clarifying-questions wizard. Assembly's requests to OpenAI are configured so that OpenAI does not retain the conversation;",
                "**Anthropic** — produces the structured build plan and the preview build path, performs the code-writing steps inside an isolated build environment. Prompts, generated code, and build history are processed and stored in connection with these services.",
                "**GitHub** — hosts the source repository created for the generated app.",
              ],
            },
          ],
        },
        {
          id: "part-3-ai-app-builder-what-assembly-sends-to-these-service-providers",
          heading: "What Assembly sends to these Service Providers",
          blocks: [
            { type: "p", text: "Assembly sends the administrator's prompt, any follow-up messages, any files the administrator attaches to the builder conversation, and the app's name, description, and configuration." },
            { type: "p", text: "It is the responsibility of the user to not enter Personal Health Information (PHI) and Personal Identification Information into the builder chat and abide by the regulatory restrictions of their industry." },
            { type: "p", text: "The finished app reaches workspace data at **runtime**, through the Assembly Platform API, as described in the next section." },
          ],
        },
        {
          id: "part-3-ai-app-builder-what-a-generated-app-can-access-once-installed",
          heading: "What a generated app can access once installed",
          blocks: [
            { type: "p", text: "A deployed app is issued an Assembly API key of its own, and each User who opens the app passes a short-lived session credential to it. Using these, the app can call the same Assembly Platform API surface available to any custom app, which includes workspace and internal-user information, clients, companies, custom fields, files, messages, forms, contracts, invoices, subscriptions, products, prices, payments, tasks, notes, and notifications — with both read and write operations where the API supports them." },
            {
              type: "list",
              items: [
                "**Permissions are inherited.** The app operates with the permissions of the User viewing it. It cannot reach data that User could not reach directly in Assembly.",
                "**Workspace scoping applies.** The app can only reach data in the workspace that installed it.",
                "**There is no per-app capability scoping.** Assembly does not currently allow an administrator to restrict a generated app to a subset of the Platform API. An installed generated app has the same breadth of API access as any other custom app in the workspace.",
              ],
            },
            { type: "p", text: "Because the app runs on third-party hosting and can make outbound network requests, **the administrator who builds and installs an app is responsible for what that app does with workspace data**, in the same way they would be for any custom application they wrote themselves and installed." },
            { type: "p", text: "Assembly does not review, audit, or approve the code a generated app contains before it is installed, and does not filter or restrict what an administrator asks the app builder to build." },
          ],
        },
        {
          id: "part-3-ai-app-builder-retention",
          heading: "Retention",
          blocks: [
            { type: "p", text: "The app builder stores durable records, and the retention below is stated explicitly rather than by reference:" },
            {
              type: "list",
              items: [
                "**App-idea prompts, follow-up messages, and generated app metadata** (name, description, icon): retained by Assembly for **as long as the app exists**, and deleted when the administrator deletes the app;",
                "**Generated application source code, version history, and builder conversation history**: **stored by service provides,** not by Assembly. Assembly stores only pointers to them. When an administrator deletes a generated app, Assembly instructs service providers to delete the associated project and conversation; any residual retention after that is governed by service provider's own retention practices;",
                "**Deployment records and preview URLs**: retained for as long as the app exists;",
                "**Deployment error output** captured during a failed build: retained with the app record until the app is deleted;",
                "**Build-planning data** generated during a build: held transiently and discarded within **approximately 30 minutes**;",
                "**Per-viewer session credentials** issued to a running app: valid for **approximately 5 minutes** and automatically deleted shortly after expiry;",
                "**The app's own database**, where one is provisioned: retained for as long as the app exists. Data the app itself writes there is controlled by the app, not by Assembly;",
                "**The installed app record** in the workspace: retained until the administrator deletes the app or removes it from the workspace's app settings;",
                "**Operational telemetry** for builds: retained in line with Assembly's general log-retention practices, described in Section 6 (Retention of Data) of the Privacy Policy.",
              ],
            },
          ],
        },
        {
          id: "part-3-ai-app-builder-deleting-a-generated-app",
          heading: "Deleting a generated app",
          blocks: [
            { type: "p", text: "An administrator can delete a generated app from the App Store section of the workspace. Deleting an app removes it from the workspace's navigation, deletes the installed app record, deletes Assembly's stored prompt and app metadata, and instructs Assembly's Service Providers to delete the hosted project and the builder conversation." },
            { type: "p", text: "Deletion is **not recoverable**. Assembly does not maintain a recycle bin or restore path for generated apps, and does not retain a copy of the generated code after deletion." },
            { type: "p", text: "Data that a generated app wrote into the workspace through the Platform API — for example, tasks or notes it created — **is workspace data and is not removed when the app is deleted**. It remains subject to the customer's normal retention configuration for Assembly." },
          ],
        },
        {
          id: "part-3-ai-app-builder-customer-responsibilities",
          heading: "Customer responsibilities",
          blocks: [
            { type: "p", text: "By building or editing an app with the app builder, the customer:" },
            {
              type: "list",
              items: [
                "Directs Assembly to send the prompt and related content to Assembly's Service Providers for the purpose of generating and hosting the app;",
                "Accepts responsibility for what the resulting application does with workspace data, including any outbound network requests it makes to services outside Assembly;",
                "Is responsible for deciding which of its internal users may build apps, and for reviewing the behavior of an app before making it visible to client-portal users;",
                "Is responsible for communicating to its own clients and end-users, where required by applicable law, that it has installed an application that may process their personal data;",
                "Should delete generated apps it no longer uses, since an installed app retains API access to the workspace until it is deleted.",
              ],
            },
          ],
        },
        {
          id: "part-3-ai-app-builder-international-data-transfers",
          heading: "International data transfers",
          blocks: [
            { type: "p", text: "The app builder's Service Providers are located in the United States. Assembly relies on the transfer mechanisms described in Section 7 of the Privacy Policy for personal data transferred internationally in connection with the app builder." },
          ],
        },
      ],
    },
    {
      id: "questions",
      title: "Questions",
      sections: [
        {
          id: "questions-intro",
          heading: null,
          blocks: [
            { type: "p", text: "If you have questions about this page or about Assembly's handling of AI and MCP data, please contact us at support@assembly.com." },
          ],
        },
      ],
    },
  ],
};
