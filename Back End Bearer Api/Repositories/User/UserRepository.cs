using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using OnlineTokenLearn.Entities.Service;
using OnlineTokenLearn.Entities.User;
using OnlineTokenLearn.Interfaces.User;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static OnlineTokenLearn.Entities.Service.ServiceResponses;

namespace OnlineTokenLearn.Repositories.User
{
    public class UserRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration config) : IUserRepository
    {
        public async Task<LoginResponse> CreateAccount(UserDTO userDTO)
        {
            if (userDTO == null)
            {
                return new LoginResponse(false, null, "Model is Empty");
            }

            var newUser = new ApplicationUser()
            {
                Name = userDTO.Name,
                Email = userDTO.Email,
                UserName = userDTO.Email
            };

            var user = await userManager.FindByEmailAsync(newUser.Email);

            if (user != null)
            {
                return new LoginResponse(false, null, "User is Already Registered!");
            }

            var createUser = await userManager.CreateAsync(newUser, userDTO.Password);
            if (!createUser.Succeeded)
            {
                return new LoginResponse(false, null, "Error Occurred.. Please Try again");
            }

            // Here i am assigning default role to the first person to register
            var checkAdmin = await roleManager.FindByNameAsync("Admin");
            if (checkAdmin == null)
            {
                await roleManager.CreateAsync(new IdentityRole() { Name = "Admin" });
                await userManager.AddToRoleAsync(newUser, "Admin");
            }
            else
            {
                var checkUser = await roleManager.FindByNameAsync("User");
                if (checkUser == null)
                {
                    await roleManager.CreateAsync(new IdentityRole() { Name = "User" });
                }

                await userManager.AddToRoleAsync(newUser, "User");
            }

            var getUserRole = await userManager.GetRolesAsync(newUser);
            var userSession = new UserSession(newUser.Id, newUser.Name, newUser.Email, getUserRole.First());
            string token = GenerateToken(userSession);

            return new LoginResponse(true, token, "Account successfully created, Yey!");
        }


        public async Task<ServiceResponses.LoginResponse> LoginAccount(LoginDTO loginDTO)
        {
            if (loginDTO == null)
            {
                return new LoginResponse(false, null!, "Login Container is Empty");
            }

            var getUser = await userManager.FindByEmailAsync(loginDTO.Email);

            if (getUser == null) return new LoginResponse(false, null!, "User Not Found");

            // Check if the user is locked out
            if (await userManager.IsLockedOutAsync(getUser))
            {
                return new LoginResponse(false, null!, "Account is locked. Please try again later.");
            }

            bool checkUserPasswordMatch = await userManager.CheckPasswordAsync(getUser, loginDTO.Password);

            if (!checkUserPasswordMatch)
            {
                // Increment failed login attempts
                await userManager.AccessFailedAsync(getUser);

                // Check if the user should be locked out
                if (getUser.AccessFailedCount >= 3)
                {
                    await userManager.SetLockoutEndDateAsync(getUser, DateTimeOffset.UtcNow.AddMinutes(30));
                    return new LoginResponse(false, null!, "Account is locked due to multiple failed login attempts. Please try again after 30 minutes.");
                }

                return new LoginResponse(false, null!, "Invalid Password!");
            }

            // Reset the access failed count on successful login
            await userManager.ResetAccessFailedCountAsync(getUser);

            var getUserRole = await userManager.GetRolesAsync(getUser);
            var userSession = new UserSession(getUser.Id, getUser.Name, getUser.Email, getUserRole.First());
            string token = GenerateToken(userSession);

            return new LoginResponse(true, token!, "Login Complete");
        }


        private string GenerateToken(UserSession user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var userClaims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: userClaims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token).ToString();
        }


        /*-----------User Functions--------------*/

        public async Task<GeneralResponse> ConfirmEmail(string userId, string token)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return new GeneralResponse(false, "User not found");

            var result = await userManager.ConfirmEmailAsync(user, token);
            return result.Succeeded ? new GeneralResponse(true, "Email confirmed successfully") : new GeneralResponse(false, "Email confirmation failed");
        }

        public async Task<GeneralResponse> ResetPassword(string email, string token, string newPassword)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null) return new GeneralResponse(false, "User not found");

            var result = await userManager.ResetPasswordAsync(user, token, newPassword);
            return result.Succeeded ? new GeneralResponse(true, "Password reset successfully") : new GeneralResponse(false, "Password reset failed");
        }

        public async Task<GeneralResponse> RequestPasswordReset(string email)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null) return new GeneralResponse(false, "User not found");

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            // Here you should send the token to the user's email. For now, just return the token for testing purposes.
            return new GeneralResponse(true, "Password reset token generated");
        }

        public async Task<GeneralResponse> UpdatePassword(string userId, string currentPassword, string newPassword)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return new GeneralResponse(false, "User not found");

            var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            return result.Succeeded ? new GeneralResponse(true, "Password updated successfully") : new GeneralResponse(false, "Password update failed");
        }

        public async Task<GeneralResponse> UpdateUserDetails(UpdateUserDTO updateUserDTO)
        {
            var user = await userManager.FindByIdAsync(updateUserDTO.Id);
            if (user == null) return new GeneralResponse(false, "User not found");

            user.Name = updateUserDTO.Name;
            user.UserName = updateUserDTO.UserName;
            var result = await userManager.UpdateAsync(user);

            return result.Succeeded ? new GeneralResponse(true, "User details updated successfully") : new GeneralResponse(false, "User details update failed");
        }

        public async Task<List<ApplicationUser>> GetAllUsers()
        {
            return userManager.Users.ToList();
        }

        public async Task<ApplicationUser> GetUserById(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            return user;
        }

        public async Task<GeneralResponse> DeleteUser(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return new GeneralResponse(false, "User not found");

            var result = await userManager.DeleteAsync(user);
            return result.Succeeded ? new GeneralResponse(true, "User deleted successfully") : new GeneralResponse(false, "User deletion failed");
        }
    }
}
