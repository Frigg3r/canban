import type { KanbanComment, KanbanTeamDetails } from '../../types/kanban';

interface CurrentUserLike {
  tab_num: number | string;
  role_name: string;
}

export function getCanArchiveTask(
  currentUser: CurrentUserLike,
  currentStatusKey: string
) {
  const isManager =
    currentUser.role_name === 'Руководитель' ||
    currentUser.role_name === 'Администратор';

  return isManager && (currentStatusKey === 'backlog' || currentStatusKey === 'done');
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

export function getCanRemoveParticipant(currentUser: CurrentUserLike, tabNum: number) {
  return (
    currentUser.role_name === 'Руководитель' ||
    currentUser.role_name === 'Администратор' ||
    Number(tabNum) === Number(currentUser.tab_num)
  );
}

export function getCanSubmitComment(
  currentTeam: KanbanTeamDetails | null,
  canCommentCurrentTeam: boolean,
  trimmedComment: string,
  commentLoading: boolean
) {
  return Boolean(currentTeam && canCommentCurrentTeam && trimmedComment && !commentLoading);
}

export function getCanDeleteComment(
  comment: KanbanComment,
  currentUser: CurrentUserLike
) {
  return Number(comment.author_tab_num) === Number(currentUser.tab_num);
}