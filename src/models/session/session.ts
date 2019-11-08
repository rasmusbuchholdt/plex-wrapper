import { PlexSessionPlayer } from './player';
import { PlexSessionUser } from './user';

export interface PlexSession {
    addedAt: string;
    art: string;
    audienceRating: string;
    audienceRatingImage: string;
    chapterSource: string;
    contentRating: string;
    duration: string;
    guid: string;
    hasPremiumPrimaryExtra: string;
    key: string;
    librarySectionID: string;
    librarySectionKey: string;
    librarySectionTitle: string;
    originallyAvailableAt: string;
    rating: string;
    ratingImage: string;
    ratingKey: string;
    sessionKey: string;
    studio: string;
    summary: string;
    title: string;
    type: string;
    updatedAt: string;
    viewOffset: string;
    year: string;
    player: PlexSessionPlayer;
    user: PlexSessionUser;
}