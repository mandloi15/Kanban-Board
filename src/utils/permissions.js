export const isAdmin = (auth) => auth?.user?.role === "admin";

export const canAddTask = (auth) => auth?.isAuthenticated === true;

export const canEditTask = (auth) => auth?.isAuthenticated === true;

export const canDeleteTask = (auth) => auth?.user?.role === "admin";

export const canAddColumn = (auth) => auth?.user?.role === "admin";

export const canEditColumn = (auth) => auth?.user?.role === "admin";

export const canDeleteColumn = (auth) => auth?.user?.role === "admin";

export const canBulkActions = (auth) => auth?.user?.role === "admin";
