import {
  IconCrown,
  IconMedal,
  IconStars,
  IconTrophy,
} from '@tabler/icons-react';

export function normalizePlace(place: number | string) {
  return Number(place);
}

export function getPlaceLabel(place: number) {
  if (place === 1) return '1 место';
  if (place === 2) return '2 место';
  if (place === 3) return '3 место';

  return `${place} место`;
}

export function getPlaceIcon(place: number) {
  if (place === 1) return <IconCrown size={22} stroke={2.2} />;
  if (place === 2) return <IconMedal size={22} stroke={2.2} />;
  if (place === 3) return <IconTrophy size={22} stroke={2.2} />;

  return <IconStars size={22} stroke={2.2} />;
}

export function getPlaceTheme(place: number) {
  if (place === 1) {
    return {
      iconColor: '#C99700',
      iconBackground: '#FFF4CC',
      badgeText: '#c58f22',
      badgeBackground: '#FFF1B8',
      cardBorder: '#F3D36A',
      cardBackground: 'linear-gradient(180deg, #FFFDF6 0%, #FFFFFF 100%)',
      shadow: '0 18px 40px rgba(214, 177, 33, 0.18)',
      rowBackground: '#FFF9E8',
      rowPlaceBackground: '#F7D774',
      rowPlaceText: '#c58f22',
      scoreColor: '#c58f22',
    };
  }

  if (place === 2) {
    return {
      iconColor: '#7A8594',
      iconBackground: '#EEF2F6',
      badgeText: '#5F6B79',
      badgeBackground: '#E8EDF2',
      cardBorder: '#D8E0E8',
      cardBackground: 'linear-gradient(180deg, #FAFCFE 0%, #FFFFFF 100%)',
      shadow: '0 12px 30px rgba(120, 136, 153, 0.12)',
      rowBackground: '#F7F9FB',
      rowPlaceBackground: '#DCE4EC',
      rowPlaceText: '#4D5A68',
      scoreColor: '#5F6B79',
    };
  }

  if (place === 3) {
    return {
      iconColor: '#B4693C',
      iconBackground: '#FCEBDD',
      badgeText: '#95542C',
      badgeBackground: '#F8DEC8',
      cardBorder: '#E9BE99',
      cardBackground: 'linear-gradient(180deg, #FFF8F3 0%, #FFFFFF 100%)',
      shadow: '0 12px 30px rgba(180, 105, 60, 0.14)',
      rowBackground: '#FFF6F0',
      rowPlaceBackground: '#F1C3A1',
      rowPlaceText: '#7A4321',
      scoreColor: '#9A5A30',
    };
  }

  return {
    iconColor: '#7C5CFA',
    iconBackground: '#EFE9FF',
    badgeText: '#6E56CF',
    badgeBackground: '#F1ECFF',
    cardBorder: '#ECE3FF',
    cardBackground: 'linear-gradient(180deg, #FAF7FF 0%, #FFFFFF 100%)',
    shadow: '0 12px 30px rgba(99, 72, 155, 0.08)',
    rowBackground: 'transparent',
    rowPlaceBackground: '#F3EEFF',
    rowPlaceText: '#6E56CF',
    scoreColor: '#2b2b2b',
  };
}