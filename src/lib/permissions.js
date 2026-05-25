export const USER_GRADES = [
  'G1 - Lead',
  'G2 - Senior',
  'G3 - Executive',
  'G4 - Support',
  'External',
];

export function normalizeGrade(grade) {
  const value = String(grade || '').toLowerCase();
  if (value.includes('lead') || value.includes('g1')) return 'lead';
  if (value.includes('senior') || value.includes('g2')) return 'senior';
  if (value.includes('executive') || value.includes('g3')) return 'executive';
  if (value.includes('support') || value.includes('junior') || value.includes('g4')) return 'support';
  if (value.includes('external') || value.includes('intern')) return 'external';
  return 'external';
}

export function getAccessForGrade(grade) {
  const normalized = normalizeGrade(grade);

  const access = {
    grade: normalized,
    nav: ['dashboard'],
    clients: { view: false, edit: false },
    services: { view: false, edit: false },
    internal: { view: false, edit: false },
    campaigns: { view: false, create: false, edit: false, scope: 'none' },
    claims: { view: false, create: false, edit: false, sync: false, scope: 'none' },
    quotation: { view: false, edit: false },
    lark: { view: false, sync: false },
  };

  if (normalized === 'lead') {
    return {
      ...access,
      nav: ['dashboard', 'clients', 'services', 'internal', 'campaigns', 'lark', 'quotation', 'claims'],
      clients: { view: true, edit: true },
      services: { view: true, edit: true },
      internal: { view: true, edit: true },
      campaigns: { view: true, create: true, edit: true, scope: 'all' },
      claims: { view: true, create: true, edit: true, sync: true, scope: 'all' },
      quotation: { view: true, edit: true },
      lark: { view: true, sync: true },
    };
  }

  if (normalized === 'senior') {
    return {
      ...access,
      nav: ['dashboard', 'clients', 'services', 'campaigns', 'claims'],
      clients: { view: true, edit: false },
      services: { view: true, edit: true },
      campaigns: { view: true, create: true, edit: true, scope: 'all' },
      claims: { view: true, create: true, edit: true, sync: false, scope: 'all' },
    };
  }

  if (normalized === 'executive') {
    return {
      ...access,
      nav: ['dashboard', 'campaigns', 'claims'],
      campaigns: { view: true, create: false, edit: true, scope: 'assigned' },
      claims: { view: true, create: true, edit: true, sync: false, scope: 'own' },
    };
  }

  if (normalized === 'support') {
    return {
      ...access,
      nav: ['dashboard', 'campaigns', 'claims'],
      campaigns: { view: true, create: false, edit: false, scope: 'assigned' },
      claims: { view: true, create: true, edit: true, sync: false, scope: 'own' },
    };
  }

  return {
    ...access,
    nav: ['dashboard', 'campaigns'],
    campaigns: { view: true, create: false, edit: false, scope: 'assigned' },
  };
}

export function isAssignedCampaign(campaign, session) {
  return campaign.assignee_id === session?.user?.personnel_id;
}

export function isOwnClaim(claim, session) {
  return claim.profile_name === session?.user?.full_name || claim.user_id === session?.user?.id;
}
