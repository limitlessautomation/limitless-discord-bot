import discord from 'discord.js';
const { Guild, GuildMember } = discord;

export class RoleService {
  /**
   * Handle user joining the server - add Pending role
   * @param member The guild member who joined
   * @returns RoleActionResult with details of the operation
   */
  static async handleUserJoin(member) {
    const result = {
      success: true,
      addedRoles: [],
      removedRoles: [],
      errors: []
    };

    try {
      const guild = member.guild;
      
      // Add 'Pending' role
      const pendingRole = guild.roles.cache.find(role => role.name === 'Pending');
      if (pendingRole) {
        await member.roles.add(pendingRole);
        result.addedRoles.push('Pending');
        console.log(`Added 'Pending' role to new user ${member.user.tag}`);
      } else {
        const error = `'Pending' role not found in guild`;
        result.errors.push(error);
        result.success = false;
        console.warn(error);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error handling user join:', error);
    }

    return result;
  }

  /**
   * Handle user accepting rules - remove Pending, add Incoming
   * @param member The guild member who accepted rules
   * @returns RoleActionResult with details of the operation
   */
  static async handleRulesAcceptance(member) {
    const result = {
      success: true,
      addedRoles: [],
      removedRoles: [],
      errors: []
    };

    try {
      const guild = member.guild;

      // Remove 'Pending' role if it exists
      const pendingRole = guild.roles.cache.find(role => role.name === 'Pending');
      if (pendingRole && member.roles.cache.has(pendingRole.id)) {
        await member.roles.remove(pendingRole);
        result.removedRoles.push('Pending');
        console.log(`Removed 'Pending' role from user ${member.user.tag}`);
      }

      // Add 'Incoming' role
      const incomingRole = guild.roles.cache.find(role => role.name === 'Incoming');
      if (incomingRole) {
        await member.roles.add(incomingRole);
        result.addedRoles.push('Incoming');
        console.log(`Added 'Incoming' role to user ${member.user.tag}`);
      } else {
        const error = `'Incoming' role not found in guild`;
        result.errors.push(error);
        result.success = false;
        console.warn(error);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error handling rules acceptance:', error);
    }

    return result;
  }

  /**
   * Handle user completing intake form - remove Incoming, add selected roles + Verified
   * @param member The guild member who completed the form
   * @param selectedRoles Array of role names based on form responses
   * @returns RoleActionResult with details of the operation
   */
  static async handleFormCompletion(member, selectedRoles) {
    const result = {
      success: true,
      addedRoles: [],
      removedRoles: [],
      errors: []
    };

    try {
      const guild = member.guild;

      // Remove 'Incoming' role if it exists
      const incomingRole = guild.roles.cache.find(role => role.name === 'Incoming');
      if (incomingRole && member.roles.cache.has(incomingRole.id)) {
        await member.roles.remove(incomingRole);
        result.removedRoles.push('Incoming');
        console.log(`Removed 'Incoming' role from user ${member.user.tag}`);
      }

      // Add selected roles based on form responses
      for (const roleName of selectedRoles) {
        const role = guild.roles.cache.find(r => r.name === roleName);
        if (role) {
          await member.roles.add(role);
          result.addedRoles.push(roleName);
          console.log(`Added role '${roleName}' to user ${member.user.tag}`);
        } else {
          const error = `Role '${roleName}' not found in guild`;
          result.errors.push(error);
          console.warn(error);
        }
      }

      // Add 'Verified' role
      const verifiedRole = guild.roles.cache.find(role => role.name === 'Verified');
      if (verifiedRole) {
        await member.roles.add(verifiedRole);
        result.addedRoles.push('Verified');
        console.log(`Added 'Verified' role to user ${member.user.tag}`);
      } else {
        const error = `'Verified' role not found in guild`;
        result.errors.push(error);
        console.warn(error);
      }

      // If there were any errors but some operations succeeded, mark as partial success
      if (result.errors.length > 0 && result.addedRoles.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error handling form completion:', error);
    }

    return result;
  }

  /**
   * Get all available roles in the guild that match our expected role names
   * @param guild The guild to check
   * @returns Object mapping role names to role IDs
   */
  static getAvailableRoles(guild) {
    const expectedRoles = [
      'Pending',
      'Incoming',
      'Verified',
      'Active',
      'Self Improvement',
      'Physical Fitness',
      'Mental Health',
      'Business Owners',
      'Mentors',
      'Networkers',
      'Advice Seekers',
      'Developers',
      'Learners',
      'Job Seekers'
    ];

    const availableRoles = {};
    
    expectedRoles.forEach(roleName => {
      const role = guild.roles.cache.find(r => r.name === roleName);
      if (role) {
        availableRoles[roleName] = role.id;
      }
    });

    return availableRoles;
  }

  /**
   * Check if a user has specific roles
   * @param member The guild member to check
   * @param roleNames Array of role names to check
   * @returns Object indicating which roles the user has
   */
  static hasRoles(member, roleNames) {
    const result = {};
    
    roleNames.forEach(roleName => {
      const role = member.guild.roles.cache.find(r => r.name === roleName);
      result[roleName] = role ? member.roles.cache.has(role.id) : false;
    });

    return result;
  }
}
