const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Clean existing data in correct order ──────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data.");

  // ── Create Users ──────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Sarah Mitchell",
      email: "admin@ticketai.com",
      password: bcrypt.hashSync("admin123", 10),
      role: "ADMIN",
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: "James Carter",
      email: "agent1@ticketai.com",
      password: bcrypt.hashSync("agent123", 10),
      role: "AGENT",
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: "Emily Rodriguez",
      email: "agent2@ticketai.com",
      password: bcrypt.hashSync("agent123", 10),
      role: "AGENT",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Michael Thompson",
      email: "customer1@ticketai.com",
      password: bcrypt.hashSync("customer123", 10),
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Lisa Nakamura",
      email: "customer2@ticketai.com",
      password: bcrypt.hashSync("customer123", 10),
      role: "CUSTOMER",
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: "David Okonkwo",
      email: "customer3@ticketai.com",
      password: bcrypt.hashSync("customer123", 10),
      role: "CUSTOMER",
    },
  });

  console.log("Created users.");

  // ── Ticket definitions ────────────────────────────────────────────
  const ticketDefs = [
    {
      title: "Unable to access billing dashboard after plan upgrade",
      description:
        "I upgraded from the Starter plan to the Professional plan yesterday. Since the upgrade, I keep getting a 403 Forbidden error whenever I try to access the billing dashboard. I can access all other sections of the app without any issues. I have tried clearing my browser cache and logging in from an incognito window but the problem persists.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Billing",
      customerId: customer1.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "CSV export times out for large datasets",
      description:
        "When I try to export our analytics data as a CSV file, the export process times out after about 60 seconds. Our dataset contains roughly 250,000 rows. Smaller exports under 50,000 rows work fine. This is blocking our monthly reporting workflow.",
      status: "OPEN",
      priority: "URGENT",
      category: "Bug Report",
      customerId: customer2.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Feature request: dark mode for the dashboard",
      description:
        "Our team works late shifts and the bright white UI causes significant eye strain. It would be great to have a dark mode toggle in the user preferences. Many modern SaaS tools now offer this. This would improve accessibility and user comfort for our entire organization.",
      status: "OPEN",
      priority: "LOW",
      category: "Feature Request",
      customerId: customer3.id,
      assignedAgentId: null,
    },
    {
      title: "Two-factor authentication not sending SMS codes",
      description:
        "I enabled two-factor authentication on my account and chose SMS as my verification method. I am not receiving the SMS verification codes when I try to log in. I have confirmed my phone number is correct and I can receive texts from other services without issues.",
      status: "RESOLVED",
      priority: "HIGH",
      category: "Account Issue",
      customerId: customer1.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "How to set up webhooks for ticket status changes?",
      description:
        "We are building an internal automation system and want to trigger actions when ticket statuses change in TicketAI. I could not find documentation on webhook configuration. Could you point me in the right direction or let me know if this feature is available on our current plan?",
      status: "CLOSED",
      priority: "MEDIUM",
      category: "General Inquiry",
      customerId: customer2.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Duplicate charges on March invoice",
      description:
        "I reviewed our March billing statement and noticed we were charged twice for the API add-on ($49.99 each instead of once). Our account ID is ACC-2847. Please investigate and issue a refund for the duplicate charge.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Billing",
      customerId: customer3.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "API rate limit exceeded unexpectedly",
      description:
        "Our application started receiving 429 Too Many Requests errors this morning even though our usage monitoring shows we are well within our plan limits. According to our logs, we are making approximately 800 requests per minute but our plan allows 2,000. This is affecting our production environment.",
      status: "OPEN",
      priority: "URGENT",
      category: "Technical Support",
      customerId: customer1.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Request to add team member roles and permissions",
      description:
        "We need more granular permission controls for our team members. Currently we only have Admin and Member roles but we need a Viewer role that can see tickets without being able to modify them, and a Manager role that can assign tickets but not change billing settings.",
      status: "OPEN",
      priority: "MEDIUM",
      category: "Feature Request",
      customerId: customer2.id,
      assignedAgentId: null,
    },
    {
      title: "SSO login redirects to blank page",
      description:
        "After configuring SAML SSO with our Okta identity provider, clicking the SSO login button redirects to a blank white page. The URL shows an authentication callback but nothing renders. Standard email/password login still works. Our IT team confirmed the Okta configuration looks correct on their end.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Technical Support",
      customerId: customer3.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "Notification emails going to spam folder",
      description:
        "Several members of our team have reported that ticket notification emails from TicketAI are being routed to their spam or junk folders in Gmail and Outlook. We have whitelisted the sender address but the issue persists. This causes us to miss important updates.",
      status: "RESOLVED",
      priority: "MEDIUM",
      category: "Technical Support",
      customerId: customer1.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Cannot delete archived tickets",
      description:
        "I am trying to permanently delete tickets that were archived over a year ago to comply with our data retention policy. The delete button appears grayed out for archived tickets. There is no option in the settings to enable deletion of archived items either.",
      status: "CLOSED",
      priority: "LOW",
      category: "Bug Report",
      customerId: customer2.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "Invoice PDF download returns corrupted file",
      description:
        "When I download the PDF invoice for February 2026, the file appears corrupted and cannot be opened in any PDF reader. I have tried downloading it in Chrome, Firefox, and Edge with the same result. Other months download correctly.",
      status: "RESOLVED",
      priority: "MEDIUM",
      category: "Billing",
      customerId: customer3.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Slow page load times on ticket list view",
      description:
        "The ticket list page takes 8-12 seconds to load when we have filters applied. Without filters it loads in about 2 seconds. We have approximately 5,000 tickets in our workspace. The slowness started about two weeks ago and has progressively gotten worse.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Bug Report",
      customerId: customer1.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "How to integrate TicketAI with Slack?",
      description:
        "We would like to receive ticket notifications directly in our Slack channels. Is there a native Slack integration available? If so, could you provide setup instructions? We are on the Professional plan.",
      status: "CLOSED",
      priority: "LOW",
      category: "General Inquiry",
      customerId: customer2.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Account locked after password reset attempt",
      description:
        "I tried to reset my password using the forgot password link but after entering my new password, my account became locked. I am now getting a message that says my account has been temporarily suspended. I need access urgently as I manage our entire support workflow.",
      status: "RESOLVED",
      priority: "URGENT",
      category: "Account Issue",
      customerId: customer3.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "Custom fields not appearing in ticket creation form",
      description:
        "I created three custom fields (Department, Region, and Contract ID) through the admin settings panel. They show up in the settings page but do not appear in the ticket creation form for our agents or customers. I have refreshed the page and tried different browsers.",
      status: "OPEN",
      priority: "MEDIUM",
      category: "Bug Report",
      customerId: customer1.id,
      assignedAgentId: null,
    },
    {
      title: "Request for annual billing option with discount",
      description:
        "We are currently paying monthly and would like to switch to annual billing. Do you offer any discounts for annual commitments? We have 25 agent seats and would like to negotiate a volume discount as well. Please let us know the available options.",
      status: "CLOSED",
      priority: "LOW",
      category: "Billing",
      customerId: customer2.id,
      assignedAgentId: agent1.id,
    },
    {
      title: "Automated ticket routing not matching correct categories",
      description:
        "The AI-powered automatic ticket routing feature is miscategorizing about 40% of incoming tickets. Billing-related tickets are being routed to Technical Support, and bug reports are being categorized as Feature Requests. This started happening after the system update last Friday.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Technical Support",
      customerId: customer3.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Mobile app crashes when viewing ticket attachments",
      description:
        "The TicketAI mobile app on iOS (version 3.2.1) crashes immediately when I tap on any ticket attachment. The crash happens for images, PDFs, and document files. I am on an iPhone 15 running iOS 18.3. Reinstalling the app did not help.",
      status: "OPEN",
      priority: "HIGH",
      category: "Bug Report",
      customerId: customer1.id,
      assignedAgentId: agent2.id,
    },
    {
      title: "Data export for GDPR compliance request",
      description:
        "We received a GDPR data subject access request and need to export all data associated with a specific customer email address. The built-in export tool only allows exporting tickets, not the associated comments, activity logs, and user metadata. We need a comprehensive export within 30 days.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      category: "Account Issue",
      customerId: customer2.id,
      assignedAgentId: agent1.id,
    },
  ];

  // ── Comment templates per ticket ──────────────────────────────────
  const commentSets: {
    content: string;
    isInternal: boolean;
    userId: string;
  }[][] = [
    // Ticket 1 - Billing dashboard access
    [
      { content: "I have reproduced this issue on my end. It looks like the permissions cache was not refreshed after the plan upgrade. Escalating to the backend team.", isInternal: true, userId: agent1.id },
      { content: "Hi Michael, we have identified the root cause. A permission sync job failed during your upgrade. We are running a manual fix now and you should have access within the hour.", isInternal: false, userId: agent1.id },
      { content: "Thank you for the quick response. I will check again in an hour.", isInternal: false, userId: customer1.id },
    ],
    // Ticket 2 - CSV export timeout
    [
      { content: "This appears to be related to the query timeout configuration. Large exports need to be handled via background jobs. Checking if the async export pipeline is available for this customer's plan.", isInternal: true, userId: agent2.id },
      { content: "Hi Lisa, we are looking into this and will have an update for you shortly. In the meantime, could you try exporting in date-range batches of 3 months at a time as a workaround?", isInternal: false, userId: agent2.id },
    ],
    // Ticket 3 - Dark mode request
    [
      { content: "Dark mode is on our Q3 roadmap. Tagging this for the product team.", isInternal: true, userId: agent1.id },
      { content: "Thank you for the suggestion, David. Dark mode is something we are actively planning. I have added your vote to our internal tracker. We will notify you when it becomes available.", isInternal: false, userId: agent1.id },
      { content: "That is great to hear. Looking forward to it.", isInternal: false, userId: customer3.id },
    ],
    // Ticket 4 - 2FA SMS codes
    [
      { content: "Checked the SMS gateway logs. The provider had a regional outage affecting US phone numbers between 2:00 PM and 5:00 PM EST yesterday. Service has been restored.", isInternal: true, userId: agent1.id },
      { content: "Hi Michael, the issue was caused by a temporary outage at our SMS provider. The service has been fully restored. Could you please try logging in again and confirm the codes are arriving?", isInternal: false, userId: agent1.id },
      { content: "Just tested it and the codes are coming through now. Thanks for resolving this so quickly.", isInternal: false, userId: customer1.id },
    ],
    // Ticket 5 - Webhooks setup
    [
      { content: "Webhook documentation is available at docs.ticketai.com/webhooks. The customer is on Professional plan which includes webhook access.", isInternal: true, userId: agent2.id },
      { content: "Hi Lisa, webhooks are available on your Professional plan. You can configure them under Settings > Integrations > Webhooks. Full documentation is available at docs.ticketai.com/webhooks. Let us know if you need any help with the setup.", isInternal: false, userId: agent2.id },
      { content: "Perfect, I found the documentation. Everything is working now. Thank you!", isInternal: false, userId: customer2.id },
    ],
    // Ticket 6 - Duplicate charges
    [
      { content: "Confirmed duplicate charge in Stripe dashboard. Processing refund of $49.99 to the original payment method. Reference: REF-88421.", isInternal: true, userId: agent1.id },
      { content: "Hi David, I have confirmed the duplicate charge and initiated a refund of $49.99. It should appear on your statement within 5-10 business days. The refund reference number is REF-88421.", isInternal: false, userId: agent1.id },
    ],
    // Ticket 7 - API rate limit
    [
      { content: "Checking the rate limiter config. There may be an issue with the sliding window counter after the last deployment. Looping in the platform team.", isInternal: true, userId: agent2.id },
      { content: "Hi Michael, we are investigating an issue with our rate limiting system that may be incorrectly counting requests. We have temporarily increased your rate limit to 3,000 RPM while we work on a permanent fix.", isInternal: false, userId: agent2.id },
      { content: "Thank you. The temporary increase is helping. Please keep me posted on the permanent fix.", isInternal: false, userId: customer1.id },
    ],
    // Ticket 8 - Team roles and permissions
    [
      { content: "This is a common enterprise request. Adding to the product backlog for the RBAC overhaul in Q2.", isInternal: true, userId: agent1.id },
      { content: "Hi Lisa, thank you for the detailed feedback on roles and permissions. Granular RBAC is on our product roadmap. We will reach out when we have a beta available for early adopters.", isInternal: false, userId: agent1.id },
    ],
    // Ticket 9 - SSO blank page
    [
      { content: "The callback URL in the SAML assertion is missing the trailing slash which causes our router to fail silently. Need to add normalization to the auth callback handler.", isInternal: true, userId: agent1.id },
      { content: "Hi David, we have identified a compatibility issue with how certain identity providers format the callback URL. Our engineering team is deploying a fix. In the meantime, could you try adding a trailing slash to the ACS URL in your Okta configuration?", isInternal: false, userId: agent1.id },
      { content: "Adding the trailing slash to the ACS URL worked as a temporary fix. Thank you! Let me know when the permanent fix is deployed.", isInternal: false, userId: customer3.id },
    ],
    // Ticket 10 - Notification emails spam
    [
      { content: "Our DKIM and SPF records are properly configured. The issue is likely related to the email content triggering spam filters. Coordinating with the email deliverability team to review our templates.", isInternal: true, userId: agent2.id },
      { content: "Hi Michael, we have updated our email templates and improved our sender reputation score. Notifications should now be delivered to your inbox correctly. Please monitor over the next few days and let us know if the issue recurs.", isInternal: false, userId: agent2.id },
      { content: "The emails have been arriving in our inbox consistently for the past three days. Looks like the fix is working. Thanks!", isInternal: false, userId: customer1.id },
    ],
    // Ticket 11 - Delete archived tickets
    [
      { content: "This is actually by design as a safeguard. Archived tickets require admin-level permanent deletion through Settings > Data Management. Adding a note to improve the UI to make this clearer.", isInternal: true, userId: agent1.id },
      { content: "Hi Lisa, archived tickets can be permanently deleted through Settings > Data Management > Purge Archived Data. This requires admin-level access as a safety measure. We realize the UI was not clear about this and we will improve the discoverability.", isInternal: false, userId: agent1.id },
      { content: "Found it. That was not intuitive at all but at least it works. Thank you.", isInternal: false, userId: customer2.id },
    ],
    // Ticket 12 - Corrupted invoice PDF
    [
      { content: "The February PDF was generated with a malformed font embedding. Regenerated the invoice from the billing engine. Verified the new file opens correctly in multiple PDF readers.", isInternal: true, userId: agent2.id },
      { content: "Hi David, we have regenerated your February 2026 invoice. The corrected PDF is now available for download in your billing section. Please try downloading it again and confirm it opens properly.", isInternal: false, userId: agent2.id },
      { content: "The new PDF downloads and opens perfectly. Thank you for the quick fix.", isInternal: false, userId: customer3.id },
    ],
    // Ticket 13 - Slow page load
    [
      { content: "Database query analysis shows a missing index on the ticket filters composite query. The query planner is doing a full table scan when multiple filters are applied. Creating a migration to add the necessary indexes.", isInternal: true, userId: agent1.id },
      { content: "Hi Michael, we have identified a database optimization issue that is causing the slow load times with filters. Our team is deploying a fix that should significantly improve performance. We expect it to be live within 24 hours.", isInternal: false, userId: agent1.id },
    ],
    // Ticket 14 - Slack integration
    [
      { content: "Customer is on Professional plan which includes the Slack integration. Pointed them to the setup guide.", isInternal: true, userId: agent2.id },
      { content: "Hi Lisa, yes we have a native Slack integration! You can set it up under Settings > Integrations > Slack. Here is our step-by-step guide: docs.ticketai.com/integrations/slack. It supports channel notifications, ticket creation from Slack, and status updates.", isInternal: false, userId: agent2.id },
      { content: "Got it set up and it works perfectly. This is going to save us a lot of time. Thank you!", isInternal: false, userId: customer2.id },
    ],
    // Ticket 15 - Account locked
    [
      { content: "Account was locked by the brute-force protection system. The password reset generated multiple failed auth attempts internally. Unlocked the account and added a note to improve the password reset flow to bypass brute-force detection.", isInternal: true, userId: agent1.id },
      { content: "Hi David, your account has been unlocked. The lockout was triggered by our security system during the password reset process. This is a known edge case that we are fixing. You can now log in with your new password.", isInternal: false, userId: agent1.id },
      { content: "I can log in now. Thank you for the fast turnaround. Please do fix that edge case though, it was quite alarming.", isInternal: false, userId: customer3.id },
    ],
    // Ticket 16 - Custom fields not appearing
    [
      { content: "Need to check if the custom fields feature flag is enabled for the ticket creation form. This might be a frontend caching issue as well.", isInternal: true, userId: agent2.id },
      { content: "Hi Michael, we are aware of an issue where newly created custom fields may not appear immediately in the ticket form. Could you try going to Settings > Custom Fields and toggling each field's visibility off and back on? This should force a refresh.", isInternal: false, userId: agent2.id },
    ],
    // Ticket 17 - Annual billing
    [
      { content: "Checked pricing matrix. 25 seats qualifies for volume discount. Annual billing gives 20% off and volume discount adds another 10%. Sending proposal to customer.", isInternal: true, userId: agent1.id },
      { content: "Hi Lisa, great news! We do offer annual billing with a 20% discount. With your 25 agent seats, you also qualify for a 10% volume discount. I have sent a detailed pricing proposal to your email. Let us know if you would like to proceed.", isInternal: false, userId: agent1.id },
      { content: "Received the proposal and it looks great. I have forwarded it to our finance team for approval. Thanks!", isInternal: false, userId: customer2.id },
    ],
    // Ticket 18 - AI routing miscategorization
    [
      { content: "The ML model was retrained last Friday with a new dataset that had labeling inconsistencies. Rolling back to the previous model version while the data team corrects the training set.", isInternal: true, userId: agent2.id },
      { content: "Hi David, we have identified the cause of the misrouting. A recent model update introduced categorization errors. We have rolled back to the previous stable version and ticket routing accuracy should be back to normal. We will monitor closely over the next 48 hours.", isInternal: false, userId: agent2.id },
      { content: "The routing seems much better today. I will keep an eye on it and let you know if there are any further issues.", isInternal: false, userId: customer3.id },
    ],
    // Ticket 19 - Mobile app crashes
    [
      { content: "Reproduced on iOS 18.3. The crash is in the attachment preview controller when loading inline previews for files larger than 5MB. Filed a bug with the mobile team, targeting a hotfix in version 3.2.2.", isInternal: true, userId: agent2.id },
      { content: "Hi Michael, we have reproduced the crash and our mobile team is working on a hotfix. In the meantime, you can view attachments by opening them in the web app. The fix will be included in version 3.2.2 which we expect to release next week.", isInternal: false, userId: agent2.id },
    ],
    // Ticket 20 - GDPR data export
    [
      { content: "GDPR request requires a comprehensive export including user profile, all tickets, comments, activity logs, and any stored metadata. The standard export tool is not sufficient. Building a custom export script for this request.", isInternal: true, userId: agent1.id },
      { content: "Hi Lisa, we understand the urgency of your GDPR request. We are preparing a comprehensive data export that includes all user data, tickets, comments, activity logs, and metadata. We will have the complete export ready within 5 business days.", isInternal: false, userId: agent1.id },
      { content: "Thank you for taking this seriously. Five business days works within our timeline. Please let me know when the export is ready.", isInternal: false, userId: customer2.id },
    ],
  ];

  // ── Activity log templates per ticket ─────────────────────────────
  const activitySets: {
    action: string;
    details: string | null;
    userId: string;
  }[][] = [
    // Ticket 1
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer1.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
    ],
    // Ticket 2
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer2.id },
      { action: "Priority changed", details: "Priority escalated from High to Urgent", userId: admin.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
    ],
    // Ticket 3
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer3.id },
      { action: "Category updated", details: "AI categorized as Feature Request", userId: admin.id },
    ],
    // Ticket 4
    [
      { action: "Ticket created", details: "Ticket submitted via email", userId: customer1.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent1.id },
    ],
    // Ticket 5
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer2.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent2.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent2.id },
      { action: "Status changed", details: "Status changed from Resolved to Closed", userId: customer2.id },
    ],
    // Ticket 6
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer3.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
    ],
    // Ticket 7
    [
      { action: "Ticket created", details: "Ticket submitted via API", userId: customer1.id },
      { action: "Priority changed", details: "Priority escalated from High to Urgent by AI", userId: admin.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
    ],
    // Ticket 8
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer2.id },
      { action: "Category updated", details: "AI categorized as Feature Request", userId: admin.id },
    ],
    // Ticket 9
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer3.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
    ],
    // Ticket 10
    [
      { action: "Ticket created", details: "Ticket submitted via email", userId: customer1.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent2.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent2.id },
    ],
    // Ticket 11
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer2.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent1.id },
      { action: "Status changed", details: "Status changed from Resolved to Closed", userId: customer2.id },
    ],
    // Ticket 12
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer3.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent2.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent2.id },
    ],
    // Ticket 13
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer1.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
    ],
    // Ticket 14
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer2.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent2.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent2.id },
      { action: "Status changed", details: "Status changed from Resolved to Closed", userId: customer2.id },
    ],
    // Ticket 15
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer3.id },
      { action: "Priority changed", details: "Priority escalated from High to Urgent", userId: admin.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent1.id },
    ],
    // Ticket 16
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer1.id },
      { action: "Category updated", details: "AI categorized as Bug Report", userId: admin.id },
    ],
    // Ticket 17
    [
      { action: "Ticket created", details: "Ticket submitted via email", userId: customer2.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
      { action: "Status changed", details: "Status changed from In Progress to Resolved", userId: agent1.id },
      { action: "Status changed", details: "Status changed from Resolved to Closed", userId: customer2.id },
    ],
    // Ticket 18
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer3.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent2.id },
    ],
    // Ticket 19
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer1.id },
      { action: "Ticket assigned", details: "Assigned to Emily Rodriguez", userId: admin.id },
    ],
    // Ticket 20
    [
      { action: "Ticket created", details: "Ticket submitted via web portal", userId: customer2.id },
      { action: "Priority changed", details: "Priority escalated from High to Urgent", userId: admin.id },
      { action: "Ticket assigned", details: "Assigned to James Carter", userId: admin.id },
      { action: "Status changed", details: "Status changed from Open to In Progress", userId: agent1.id },
    ],
  ];

  // ── Create tickets with comments and activity logs ────────────────
  for (let i = 0; i < ticketDefs.length; i++) {
    const def = ticketDefs[i];
    const comments = commentSets[i];
    const activities = activitySets[i];

    // Stagger creation dates across the past 60 days
    const daysAgo = 60 - i * 3;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const ticket = await prisma.ticket.create({
      data: {
        title: def.title,
        description: def.description,
        status: def.status,
        priority: def.priority,
        category: def.category,
        customerId: def.customerId,
        assignedAgentId: def.assignedAgentId,
        createdAt,
      },
    });

    // Create comments with staggered timestamps
    for (let j = 0; j < comments.length; j++) {
      const commentDate = new Date(createdAt);
      commentDate.setHours(commentDate.getHours() + (j + 1) * 4);

      await prisma.comment.create({
        data: {
          content: comments[j].content,
          isInternal: comments[j].isInternal,
          ticketId: ticket.id,
          userId: comments[j].userId,
          createdAt: commentDate,
        },
      });
    }

    // Create activity log entries with staggered timestamps
    for (let k = 0; k < activities.length; k++) {
      const activityDate = new Date(createdAt);
      activityDate.setMinutes(activityDate.getMinutes() + k * 30);

      await prisma.activityLog.create({
        data: {
          action: activities[k].action,
          details: activities[k].details,
          ticketId: ticket.id,
          userId: activities[k].userId,
          createdAt: activityDate,
        },
      });
    }

    console.log(`Created ticket ${i + 1}/20: ${def.title.substring(0, 50)}...`);
  }

  console.log("\nSeeding complete!");
  console.log("  - 6 users (1 admin, 2 agents, 3 customers)");
  console.log("  - 20 tickets with varied statuses and priorities");
  console.log("  - Comments and activity logs for each ticket");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
