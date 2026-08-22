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
        if (notaFiscalDb == null) return Result<NotaFiscalDto>.Failure("A Nota nao existe.");
        var response = new NotaFiscalDto
        {
            Id = notaFiscalDb.Id,
            Ativo = notaFiscalDb.Ativo,
            ItemNotasFiscal = notaFiscalDb.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                ItemId = item.ItemId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Saldo = item.Saldo
            }).ToList()

        };
            return Result<NotaFiscalDto>.Success(response); 
    }
    


public async Task<Result<IEnumerable<ObterNotasFiscaisListDto?>>> ObterNotasFiscaisListAsync(
        CancellationToken cancellationToken = default)
    {
        var notasFiscaisDb = await _repository.ObterNotasFiscaisListAsync(cancellationToken);
        var notasFiscaisDbList = notasFiscaisDb.ToList();
        if (notasFiscaisDbList.Any() == false)
        {
            return Result<IEnumerable<ObterNotasFiscaisListDto?>>.Failure("Não foi possivel obter as notas fiscais.");
        }
        var response = notasFiscaisDb.Select(nf => new ObterNotasFiscaisListDto
        {
            Id = nf!.Id,
            Ativo = nf.Ativo,
            ItemNotasFiscal = nf.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                ItemId = item.ItemId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Saldo = item.Saldo
            }).ToList()
        });

        return Result<IEnumerable<ObterNotasFiscaisListDto?>>.Success(response);
    }

    public async Task<Result<RemoverNotaFiscalDto>> RemoverNotaFiscalPorIdAsync(int id,
        CancellationToken cancellationToken = default)
    {
        var notaFiscalDb = await _repository.ObterNotaFiscalPorIdAsync(id, cancellationToken);
        if (notaFiscalDb == null)
            return Result<RemoverNotaFiscalDto>.Failure("Nao existe Nota Fiscal com este ItemId.");
        var response = new RemoverNotaFiscalDto
        {
            Id = notaFiscalDb.Id,
            Ativo = notaFiscalDb.Ativo,
            ItemNotasFiscal = notaFiscalDb.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto()
            {
                ItemId = item.ItemId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Saldo = item.Saldo
            }).ToList()
        };
        await _repository.RemoverNotaFiscalPorIdAsync(id, cancellationToken);
        return Result<RemoverNotaFiscalDto>.Success(response);
    }

    public async Task<Result<AtualizarNotaFiscalDto>> AtualizarNotaFiscalPorIdAsync(int notaFiscalId, AtualizarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        var notaFiscalExistente = await _repository.ObterNotaFiscalPorIdAsync(notaFiscalId, cancellationToken);

        if (notaFiscalExistente == null)
            return Result<AtualizarNotaFiscalDto>.Failure("Nota fiscal não encontrada.");

        var novosItens = notaFiscal.ItemNotasFiscal.Select(itemDto =>
            new ItemNotaFiscal(
                itemDto.ItemId,
                itemDto.Codigo,
                itemDto.Descricao,
                itemDto.Saldo
            )
        ).ToList();

        notaFiscalExistente.Atualizar(notaFiscal.Ativo, novosItens);

        await _repository.AtualizarNotaFiscalPorIdAsync(notaFiscalExistente, cancellationToken);

        var responseDto = new AtualizarNotaFiscalDto()
        {
            Id = notaFiscalExistente.Id,
            Ativo = notaFiscalExistente.Ativo,
            ItemNotasFiscal = notaFiscalExistente.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                ItemId = item.ItemId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Saldo = item.Saldo
            }).ToList()
        };

        return Result<AtualizarNotaFiscalDto>.Success(responseDto);
    }
}