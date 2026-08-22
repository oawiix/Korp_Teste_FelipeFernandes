namespace Faturamento.Application.DTOs;

public record ResponseModel<T>(T Data, string Message, bool Success, DateTime TimeStamp);