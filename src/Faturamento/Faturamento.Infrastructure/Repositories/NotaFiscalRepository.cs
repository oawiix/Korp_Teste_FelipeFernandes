using Faturamento.Domain.Entities;
using Faturamento.Domain.Repositories;
using Faturamento.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Faturamento.Infrastructure.Repositories;

public class NotaFiscalRepository : INotaFiscalRepository
{
    private readonly FaturamentoDbContext _context;
    
    public NotaFiscalRepository(FaturamentoDbContext context)
    {
        _context = context;
    }

    public async Task<NotaFiscal?> ObterNotaFiscalPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var notaFiscalDb = await _context.NotaFiscal.
            Include(n => n.ItemNotaFiscal).
            AsNoTracking().
            FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        return notaFiscalDb;
    }

    public async Task<IReadOnlyCollection<NotaFiscal?>> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default)
    {
            List<NotaFiscal> notasFiscaisDb = await _context.NotaFiscal
                .Include(n => n.ItemNotaFiscal)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
            return notasFiscaisDb;
    }

    public async Task<NotaFiscal?> RemoverNotaFiscalPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var notaFiscalDb = await _context.NotaFiscal.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (notaFiscalDb == null) return null;
        _context.NotaFiscal.Remove(notaFiscalDb);
        await _context.SaveChangesAsync(cancellationToken);
        return notaFiscalDb;
    }

    public async Task<NotaFiscal?> AtualizarNotaFiscalPorIdAsync(int id, bool ativo,  List<ItemNotaFiscal> itemNotaFiscal, CancellationToken cancellationToken = default)
    {
        var oldNotaFiscal = await _context.NotaFiscal
            .Include(n => n.ItemNotaFiscal)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (oldNotaFiscal == null) return null;

        if (ativo)
            oldNotaFiscal.Ativar();
        else
            oldNotaFiscal.Desativar();

        _context.ItemNotaFiscal.RemoveRange(oldNotaFiscal.ItemNotaFiscal);
        oldNotaFiscal.ItemNotaFiscal.Clear();

        foreach (var item in itemNotaFiscal)
        {
            oldNotaFiscal.AddItemToNotaFiscal(item);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return oldNotaFiscal;
    }

    public async Task<NotaFiscal?> CriarNotaFiscalAsync(NotaFiscal notaFiscal, CancellationToken cancellationToken = default)
    {
        await _context.NotaFiscal.AddAsync(notaFiscal, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return notaFiscal;
    }
}