using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTokenLearn.Entities.User;
using OnlineTokenLearn.Interfaces.User;
using OnlineTokenLearn.Repositories.User;

namespace OnlineTokenLearn.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class UserAccountController(IUserRepository userRepository) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserDTO userDTO) {
            var response = await userRepository.CreateAccount(userDTO);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO) {
            var response = await userRepository.LoginAccount(loginDTO);
            return Ok(response);
        }


        /*-----------User Functions--------------*/

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            var response = await userRepository.ConfirmEmail(userId, token);
            return Ok(response);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(string email, string token, string newPassword)
        {
            var response = await userRepository.ResetPassword(email, token, newPassword);
            return Ok(response);
        }

        [HttpPost("request-password-reset")]
        public async Task<IActionResult> RequestPasswordReset(string email)
        {
            var response = await userRepository.RequestPasswordReset(email);
            return Ok(response);
        }

        [HttpPost("update-password")]
        public async Task<IActionResult> UpdatePassword(string userId, string currentPassword, string newPassword)
        {
            var response = await userRepository.UpdatePassword(userId, currentPassword, newPassword);
            return Ok(response);
        }

        [HttpGet("all-users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await userRepository.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            var user = await userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }
            return Ok(user);
        }

        [HttpPost("update-details")]
        public async Task<IActionResult> UpdateUserDetails(UpdateUserDTO updateUserDTO)
        {
            var response = await userRepository.UpdateUserDetails(updateUserDTO);
            return Ok(response);
        }

        [HttpDelete("delete-user/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var response = await userRepository.DeleteUser(userId);
            return Ok(response);
        }
    }
}
