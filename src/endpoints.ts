export const LIST = "https://itemconfiguration.roblox.com/v1/creations/get-assets?assetType=24&isArchived=false&limit=100"
export const LOGOUT = "https://auth.roblox.com/v2/logout"
export const AUTHENTICATED = "https://users.roblox.com/v1/users/authenticated"

export const asset = (id: number) =>
  `https://assetdelivery.roblox.com/v1/asset/?id=${id}`
export const userList = (userId: number, cursor = "") =>
  LIST +
  (cursor !== "" ? `&cursor=${cursor}` : "")
export const groupList = (groupId: number, cursor = "") =>
  LIST +
  `&groupId=${groupId}` +
  (cursor !== "" ? `&cursor=${cursor}` : "")
export const publish = (title: string, description: string, groupId?: number) =>
  "https://www.roblox.com/ide/publish/uploadnewanimation" +
  "?assetTypeName=Animation" +
  `&name=${encodeURIComponent(title)}` +
  `&description=${encodeURIComponent(description)}` +
  "&AllID=1" +
  "&ispublic=False" +
  "&allowComments=True" +
  "&isGamesAsset=False" +
  (groupId != null ? `&groupId=${groupId}` : "")
