require("dotenv").config();
const PRO_ROLE = process.env.PRO_ROLE_ID;
const NOVICE_ROLE = process.env.NOVICE_ROLE_ID;
const INTERMEDIATE_ROLE = process.env.INTERMEDIATE_ROLE_ID;

// a function that checks whether a member is new in the server or not.
async function alreadyExisted(oldMember) {
  const proRole = await oldMember.guild.roles.fetch(PRO_ROLE);
  const noviceRole = await oldMember.guild.roles.fetch(NOVICE_ROLE);
  const intermediateRole = await oldMember.guild.roles.fetch(INTERMEDIATE_ROLE);
  // if a member has atleast one of the 3 roles, it means that the user was already present in the server.
  return (
    oldMember.roles.cache.some((r) => r.id === proRole.id) ||
    oldMember.roles.cache.some((r) => r.id === noviceRole.id) ||
    oldMember.roles.cache.some((r) => r.id === intermediateRole.id)
  );
}

module.exports = { alreadyExisted };
