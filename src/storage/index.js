
const ITCAgentToken = "__ITCAGENT__TOKEN__";

function setCurrentUser(token) {
  localStorage.setItem(ITCAgentToken, token);
}

function getCurrentUser() {
  try {
    var user = localStorage.getItem(ITCAgentToken);
    return user;
  } catch (error) {
    return null;
  }
}

function removeCurrentUser() {
  localStorage.removeItem(ITCAgentToken);
}

const authService = {
  setCurrentUser,
  getCurrentUser,
  removeCurrentUser,
};

export default authService