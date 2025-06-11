export const DOMAIN_CLIENT = "3dtour"
const DOMAIN = "https://3dtour.io.vn/app/api";

export const API_URLS = {
  BASE: `${DOMAIN}`,
  LOGIN: `${DOMAIN}/login`,
  LOGOUT: `${DOMAIN}/authenticate/logout`,
  REGISTER: `${DOMAIN}/register`,
  USER: `${DOMAIN}/user`,
  VERIFY: `${DOMAIN}/authenticate/verifyEmail`,
  REFRESH_TOKEN: `${DOMAIN}/authenticate/refresh`,
  FORGOT_PASSWORD: `${DOMAIN}/user/forgotPassword`,
  CHANGE_PROFILE: `${DOMAIN}/user/updateProfile`,
  CHANGE_PASSWORD: `${DOMAIN}/user/updatePassword`,
  CHANGE_AVATAR: `${DOMAIN}/user/updateAvatar`,
  CHANGE_NODE_STATUS: `${DOMAIN}/node/changeStatus`,
  REMOVE_NODE: `${DOMAIN}/node/remove`,

  UPLOAD_CLOUD: `${DOMAIN}/v1/admin/cloud/upload`,

  GET_MASTER_NODES: `${DOMAIN}/node/master`,
  GET_PRELOAD_NODES: `${DOMAIN}/node/preloadNodeList`,
  GET_DEFAULT_NODE: `${DOMAIN}/node/default`,
  PRIVATE_NODE_OF_USER: `${DOMAIN}/node/privateByUser`,
  NODE_OF_USER: `${DOMAIN}/node/byUser`,
  NODE_BY_ID: `${DOMAIN}/node/byId`,
  COMMENT_OF_NODE: `${DOMAIN}/comment/getOfNode`,
  NUM_COMMENT_OF_USER: `${DOMAIN}/comment/getNumOfUser`,
  SEND_COMMENT: `${DOMAIN}/comment/send`,
  EDIT_COMMENT: `${DOMAIN}/comment/update`,
  REMOVE_COMMENT: `${DOMAIN}/comment/remove`,
  
  ADMIN_GET_ALL_NODES: `${DOMAIN}/v1/admin/node/all`,
  ADMIN_GET_ALL_SPACES: `${DOMAIN}/admin/space/all`,
  ADMIN_GET_SPACE_OF_FIELD: `${DOMAIN}/admin/space/byField`,
  ADMIN_GET_ALL_ICONS: `${DOMAIN}/v1/admin/icon`,
  ADMIN_GET_HOTSPOT_TYPES: `${DOMAIN}/admin/hotspotType`,
  ADMIN_GET_ALL_FIELDS: `${DOMAIN}/admin/field`,

  ADMIN_CREATE_NODES: `${DOMAIN}/v1/admin/node/insert`,
  ADMIN_ATTACH_SPACE_LOCATION: `${DOMAIN}/admin/space/attachLocation`,
  ADMIN_REMOVE_SPACE_LOCATION: `${DOMAIN}/admin/space/removeLocation`,

  ADMIN_CHANGE_FIELD_STATUS: `${DOMAIN}/admin/field/changeStatus`,
  ADMIN_CHANGE_ICON_STATUS: `${DOMAIN}/admin/field/changeStatus`,
};
