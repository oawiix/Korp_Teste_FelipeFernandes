using Faturamento.Application.Common;
using Faturamento.Application.DTOs;
using Faturamento.Domain.Entities;
using Faturamento.Domain.Repositories;
using Korp.MessageContracts.Events;
using MassTransit;
using ItemNotaFiscalDto = Faturamento.Application.DTOs.ItemNotaFiscalDto;


namespace Faturamento.Application.Services;

public class NotaFiscalService : INotaFiscalService
{
    private readonly INotaFiscalRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;

    public NotaFiscalService(INotaFiscalRepository repository, IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
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
            ItemNotaFiscal = notaFiscalDb.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                ItemId = item.ProdutoId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Quantidade = item.Saldo
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
            ItemNotaFiscal = nf.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                ItemId = item.ProdutoId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Quantidade = item.Saldo
            }).ToList()
        });

        return Result<IEnumerable<ObterNotasFiscaisListDto?>>.Success(response);
    }

    public async Task<Result<RemoverNotaFiscalDto>> RemoverNotaFiscalPorIdAsync(int id,
        CancellationToken cancellationToken = default)
    {
        var notaFiscalDb = await _repository.ObterNotaFiscalPorIdAsync(id, cancellationToken);
        if (notaFiscalDb == null)
            return Result<RemoverNotaFiscalDto>.Failure("Nao existe Nota Fiscal com este ProdutoId.");
        var response = new RemoverNotaFiscalDto
        {
            Id = notaFiscalDb.Id,
            Ativo = notaFiscalDb.Ativo,
            ItemNotaFiscal = notaFiscalDb.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto()
            {
                ItemId = item.ProdutoId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Quantidade = item.Saldo
            }).ToList()
        };
        await _repository.RemoverNotaFiscalPorIdAsync(id, cancellationToken);
        return Result<RemoverNotaFiscalDto>.Success(response);
    }

    public async Task<Result<AtualizarNotaFiscalDto>> AtualizarNotaFiscalPorIdAsync(int notaFiscalId,
        AtualizarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        var notaFiscalExistente = await _repository.ObterNotaFiscalPorIdAsync(notaFiscalId, cancellationToken);

        if (notaFiscalExistente == null)
            return Result<AtualizarNotaFiscalDto>.Failure("Nota fiscal não encontrada.");

        var novosItens = notaFiscal.ItemNotaFiscal.Select(itemDto =>
            new ItemNotaFiscal(
                itemDto.ItemId,
                itemDto.Codigo,
                itemDto.Descricao,
                itemDto.Quantidade
            )
        ).ToList();

        notaFiscalExistente.Atualizar(notaFiscal.Ativo, novosItens);

        await _repository.AtualizarNotaFiscalPorIdAsync(notaFiscalExistente, cancellationToken);

        var response = new AtualizarNotaFiscalDto()
        {
            Id = notaFiscalExistente.Id,
            Ativo = notaFiscalExistente.Ativo,
            ItemNotaFiscal = notaFiscalExistente.ItemNotaFiscal.Select(item => new ItemNotaFiscalDto
            {
                ItemId = item.ProdutoId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Quantidade = item.Saldo
            }).ToList()
        };

        return Result<AtualizarNotaFiscalDto>.Success(response);
    }

    public async Task<Result<CriarNotaFiscalDto>> CriarNotaFiscalAsync(CriarNotaFiscalDto notaFiscalDto,
        CancellationToken cancellationToken = default)
    {
        var itensEntidades = notaFiscalDto.ItemNotaFiscal?
            .Select(i => new ItemNotaFiscal(
                i.ProdutoId,
                i.Codigo,
                i.Descricao,
                i.Quantidade
            ))
            .ToList() ?? new List<ItemNotaFiscal>();

        var notaFiscal = new NotaFiscal(0, notaFiscalDto.Ativo, itensEntidades);

        var response = await _repository.CriarNotaFiscalAsync(notaFiscal, cancellationToken);

        if (response == null)
        {
            return Result<CriarNotaFiscalDto>.Failure("Não foi possível criar a nota fiscal.");
        }

        var responseSuccess = new CriarNotaFiscalDto
        {
            Id = response.Id,
            Ativo = response.Ativo,
            ItemNotaFiscal = response.ItemNotaFiscal?.Select(item => new CriarItemNotaFiscalDto
            {
                ProdutoId =  item.ProdutoId,
                Codigo = item.Codigo,
                Descricao = item.Descricao,
                Quantidade = item.Saldo
            }).ToList() ?? new List<CriarItemNotaFiscalDto>()
        };

        var itensParaEvento = responseSuccess.ItemNotaFiscal?
            .Select(i => new Korp.MessageContracts.Events.ItemNotaFiscalDto(i.ProdutoId, i.Quantidade))
            .ToList() ?? new List<Korp.MessageContracts.Events.ItemNotaFiscalDto>();

        var evento = new NotaFiscalParaImpressaoEvent(response.Id, itensParaEvento);
        await _publishEndpoint.Publish(evento, cancellationToken);

        return Result<CriarNotaFiscalDto>.Success(responseSuccess);
    }
}