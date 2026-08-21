namespace Faturamento.Application.DTOs;

public record ResponseModel<T>(T data, string Message, bool Success, DateTime TimeStamp);