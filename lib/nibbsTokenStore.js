let nibbsToken = null;

export const setNibbsToken = (token) => {
  nibbsToken = token;
};

export const getNibbsToken = () => {
  return nibbsToken;
};

export default {
  setNibbsToken,
  getNibbsToken,
};
