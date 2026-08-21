using Faturamento.Application.Common;
using Faturamento.Application.DTOs;
using Faturamento.Domain.Entities;
using Faturamento.Domain.Repositories;

namespace Faturamento.Application.Services;

public class NotaFiscalService : INotaFiscalService
{
    private readonly INotaFiscalRepository _repository;

    public NotaFiscalService(INotaFiscalRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<NotaFiscalDto>> ObterNotaFiscalPorIdAsync(int id,
        CancellationToken cancellationToken = default)
    {
        var notaFiscalDb = await _repository.ObterNotaFiscalPorIdAsync(id, cancellationToken);
        if (notaFiscalDb == null) return Result<NotaFiscalDto>.Failure("A Nota fiscal não existe.");
        return Result<NotaFiscalDto>.Success(new NotaFiscalDto());
    }

    public async Task<Result<IEnumerable<ObterNotasFiscaisListDto>>> ObterNotasFiscaisListAsync(
        CancellationToken cancellationToken = default)
    {
        var notasFiscaisDb = await _repository.ObterNotasFiscaisListAsync(cancellationToken);

        var response = notasFiscaisDb.Select(nf => new ObterNotasFiscaisListDto
        {
            Id = nf.Id,
            Ativo = nf.Ativo,
            ItemNotasFiscal = nf.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                Id = item.Id,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Saldo = item.Saldo
            }).ToList()
        });

        return Result<IEnumerable<ObterNotasFiscaisListDto>>.Success(response);
    }

    public async Task<Result<NotaFiscalDto>> RemoverNotaFiscalPorIdAsync(int id,
        CancellationToken cancellationToken = default)
    {
        var response = await _repository.RemoverNotaFiscalPorIdAsync(id, cancellationToken);
        if (await _repository.ObterNotaFiscalPorIdAsync(id, cancellationToken) == null)
            return Result<NotaFiscalDto>.Failure("Nota fiscal removida.");
        return Result<NotaFiscalDto>.Success(new NotaFiscalDto());
    }

    public async Task<Result<NotaFiscalDto>> AtualizarNotaFiscalPorIdAsync(AtualizarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        var notaFiscalExistente = await _repository.ObterNotaFiscalPorIdAsync(notaFiscal.Id, cancellationToken);

        if (notaFiscalExistente == null)
            return Result<NotaFiscalDto>.Failure("Nota fiscal não encontrada.");

        var novosItens = notaFiscal.ItemNotasFiscal.Select(itemDto =>
            new ItemNotaFiscal(
                itemDto.Id,
                itemDto.Codigo,
                itemDto.Descricao,
                itemDto.Saldo
            )
        ).ToList();

        notaFiscalExistente.Atualizar(notaFiscal.Ativo, novosItens);

        await _repository.AtualizarNotaFiscalPorIdAsync(notaFiscalExistente, cancellationToken);

        var responseDto = new NotaFiscalDto
        {
            Id = notaFiscalExistente.Id,
            Ativo = notaFiscalExistente.Ativo,
            ItemNotasFiscal = notaFiscalExistente.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                Id = item.Id,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Saldo = item.Saldo
            }).ToList()
        };

        return Result<NotaFiscalDto>.Success(responseDto);
    }
}