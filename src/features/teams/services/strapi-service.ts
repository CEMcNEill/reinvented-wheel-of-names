import qs from 'qs';

const API_HOST = 'https://better-animal-d658c56969.strapiapp.com';

export interface StrapiTeam {
    id: number;
    name: string;
    slug: string;
    crestUrl?: string;
}

export interface StrapiMember {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role?: string | null;
    isLead?: boolean;
}

interface StrapiResponse<T> {
    data: T;
}

interface StrapiTeamAttribute {
    name: string;
    slug: string;
    crest?: {
        data?: {
            attributes?: {
                url?: string;
            };
        };
    };
}

interface StrapiTeamData {
    id: number;
    attributes: StrapiTeamAttribute;
}

interface StrapiMemberAttribute {
    firstName: string;
    lastName: string;
    companyRole?: string;
    avatar?: {
        data?: {
            attributes?: {
                url?: string;
            };
        };
    };
}

interface StrapiProfileData {
    id: number;
    attributes: StrapiMemberAttribute;
}

interface StrapiTeamDetailsAttributes {
    name: string;
    profiles: {
        data: StrapiProfileData[];
    };
    leadProfiles?: {
        data: { id: number }[];
    };
}

interface StrapiTeamDetailsData {
    id: number;
    attributes: StrapiTeamDetailsAttributes;
}

export interface StrapiTeamDetails {
    teamName: string;
    members: StrapiMember[];
}

// Helper to get full image URL
const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_HOST}${url}`;
};

export async function fetchTeams(): Promise<StrapiTeam[]> {
    const query = qs.stringify({
        fields: ['name', 'slug'],
        populate: {
            crest: {
                populate: '*'
            }
        },
        pagination: {
            pageSize: 100,
        }
    }, { encodeValuesOnly: true });

    const response = await fetch(`${API_HOST}/api/teams?${query}`);
    const { data }: StrapiResponse<StrapiTeamData[]> = await response.json();

    return data.map((team) => ({
        id: team.id,
        name: team.attributes.name,
        slug: team.attributes.slug,
        crestUrl: getFullImageUrl(team.attributes.crest?.data?.attributes?.url)
    }));
}

export async function fetchTeamMembers(slug: string): Promise<StrapiTeamDetails | null> {
    const query = qs.stringify({
        filters: {
            slug: { $eqi: slug },
        },
        populate: {
            profiles: {
                populate: ['avatar'],
                fields: ['firstName', 'lastName', 'companyRole'],
            },
            leadProfiles: {
                fields: ['id']
            }
        },
    }, { encodeValuesOnly: true });

    const response = await fetch(`${API_HOST}/api/teams?${query}`);
    const json: StrapiResponse<StrapiTeamDetailsData[]> = await response.json();

    if (!json.data || json.data.length === 0) {
        return null; // Team not found
    }
    const team = json.data[0];

    // Extract lead profile IDs
    const leadIds: number[] = (team.attributes.leadProfiles?.data || []).map((lead) => lead.id);

    // Map to a simplified structure with lead detection
    const members = team.attributes.profiles.data.map((profile) => ({
        id: profile.id,
        firstName: profile.attributes.firstName,
        lastName: profile.attributes.lastName,
        avatarUrl: getFullImageUrl(profile.attributes.avatar?.data?.attributes?.url) || null,
        role: profile.attributes.companyRole || null,
        isLead:
            leadIds.includes(profile.id) ||
            /\blead\b/i.test(profile.attributes.companyRole || ''),
    }));

    return {
        teamName: team.attributes.name,
        members: members,
    };
}
