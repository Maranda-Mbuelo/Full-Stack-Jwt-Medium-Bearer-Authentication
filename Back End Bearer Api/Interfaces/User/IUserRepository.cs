using Microsoft.AspNetCore.Identity;
using OnlineTokenLearn.Entities.User;
using static OnlineTokenLearn.Entities.Service.ServiceResponses;

namespace OnlineTokenLearn.Interfaces.User
{
    public interface IUserRepository
    {
        Task<LoginResponse> CreateAccount(UserDTO userDTO);
        Task<LoginResponse> LoginAccount(LoginDTO loginDTO);
        Task<List<ApplicationUser>> GetAllUsers();
        Task<ApplicationUser> GetUserById(string userId);
        Task<GeneralResponse> ConfirmEmail(string userId, string token);
        Task<GeneralResponse> ResetPassword(string email, string token, string newPassword);
        Task<GeneralResponse> RequestPasswordReset(string email);
        Task<GeneralResponse> UpdatePassword(string userId, string currentPassword, string newPassword);
        Task<GeneralResponse> UpdateUserDetails(UpdateUserDTO updateUserDTO);
        Task<GeneralResponse> DeleteUser(string userId);
    }
}
