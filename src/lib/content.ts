// Editorial content for the blog. Static data — replace with real posts when
// available. (No customer stories: pre-launch startup.)

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  body: { h: string; p: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    "slug": "mcp-control-plane",
    "title": "Why MCP connections need access rules",
    "date": "Sep 12, 2026",
    "description": "A connection standard does not decide which tools an agent should be allowed to use.",
    "body": [
      {
        "h": "Connection is not permission",
        "p": [
          "Model Context Protocol (MCP) connects AI agents to tools and data. Teams still need to decide which servers are trusted and which actions are allowed."
        ]
      },
      {
        "h": "Check before forwarding",
        "p": [
          "A gateway can check requests against tool rules before forwarding them. Start by approving the servers a team needs and blocking actions it should not perform."
        ]
      },
      {
        "h": "Keep a useful record",
        "p": [
          "Record the caller, tool and decision. This gives reviewers a way to investigate a blocked call or understand which rule allowed it."
        ]
      }
    ]
  },
  {
    "slug": "tool-poisoning-explained",
    "title": "Tool poisoning: hidden instructions in tool content",
    "date": "Sep 28, 2026",
    "description": "How tool descriptions can redirect an agent, and what to review before connecting a server.",
    "body": [
      {
        "h": "What it is",
        "p": [
          "Tool poisoning places malicious instructions in content an agent reads, such as a tool description. Those instructions may try to change the task or make the agent reveal data."
        ]
      },
      {
        "h": "What to review",
        "p": [
          "Check who operates the server, which tools it exposes and what data those tools can access. Review changes to tool descriptions as well as code."
        ]
      },
      {
        "h": "Limit the damage",
        "p": [
          "Use trusted servers, narrow tool permissions and credentials with limited access. Content inspection can add another check, but no single control guarantees that an agent will ignore every malicious instruction."
        ]
      }
    ]
  },
  {
    "slug": "shipping-agents-safely",
    "title": "An agent rollout checklist",
    "date": "Oct 2, 2026",
    "description": "A short checklist for choosing tools, limiting access and reviewing activity.",
    "body": [
      {
        "h": "Before rollout",
        "p": [
          "1. Assign an owner to each agent or integration.\n2. Approve the servers and tools it needs.\n3. Use separate credentials with limited access."
        ]
      },
      {
        "h": "During use",
        "p": [
          "4. Check tool calls against access rules.\n5. Record decisions and review blocked or flagged calls.\n6. Revoke unused keys and remove connections that are no longer needed."
        ]
      },
      {
        "h": "Before expanding",
        "p": [
          "Confirm that the pilot can do its intended work without broader access. Test a blocked call and check that its audit record explains the decision."
        ]
      }
    ]
  }
];
