import type { KanbanComment, KanbanStatus, KanbanTeamDetails } from '../../types/kanban';

interface CurrentUserLike {
  tab_num: number | string;
  role_name: string;
}

function getIsManager(currentUser: CurrentUserLike) {
  return (
    currentUser.role_name === 'Руководитель' ||
    currentUser.role_name === 'Администратор'
  );
}

export function getCanArchiveTask(
  currentUser: CurrentUserLike,
  currentStatusKey: string
) {
  return getIsManager(currentUser) && (currentStatusKey === 'backlog' || currentStatusKey === 'done');
}

export function getCanCommentCurrentTeam(
  currentTeam: KanbanTeamDetails | null,
  currentUser: CurrentUserLike
) {
  return (
    currentTeam?.participants.some(
      (participant) => Number(participant.tab_num) === Number(currentUser.tab_num)
    ) ?? false
  );
}

export function getCanEditTeam(
  isBacklogView: boolean,
  currentTeam: KanbanTeamDetails | null,
  canCommentCurrentTeam: boolean
) {
  return !isBacklogView && currentTeam?.status === 'inProgress' && canCommentCurrentTeam;
}

export function getCanReviewTeam(
  currentUser: CurrentUserLike,
  currentTeam: KanbanTeamDetails | null
) {
  return getIsManager(currentUser) && currentTeam?.status === 'review';
}

export function getCanRemoveParticipant(currentUser: CurrentUserLike, tabNum: number) {
  return (
    getIsManager(currentUser) ||
    Number(tabNum) === Number(currentUser.tab_num)
  );
}

export function getCanEditTask(currentUser: CurrentUserLike) {
  return getIsManager(currentUser);
}

export function getCanEditQuota(boardStatus: KanbanStatus) {
  return boardStatus === 'backlog';
}

export function getCanSubmitComment(
  canCommentCurrentTeam: boolean,
  trimmedComment: string,
  commentLoading: boolean
) {
  return canCommentCurrentTeam && trimmedComment.length > 0 && !commentLoading;
}

export function getCanDeleteComment(
  comment: KanbanComment,
  currentUser: CurrentUserLike
) {
  return Number(comment.author_tab_num) === Number(currentUser.tab_num);
}