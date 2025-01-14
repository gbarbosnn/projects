import { defineAbilityFor } from '@repo/auth'

const ability = defineAbilityFor({
  role: 'MEMBER'
})

const userCanInvite = ability.can("manage", "User")

console.log(userCanInvite)