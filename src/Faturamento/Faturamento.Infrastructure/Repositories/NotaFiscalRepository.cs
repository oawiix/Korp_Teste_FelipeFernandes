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

    public async Task<IEnumerable<NotaFiscal?>> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default)
    {
            List<NotaFiscal> notasFiscaisDb = await _context.NotaFiscal
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

    public async Task<NotaFiscal?> AtualizarNotaFiscalPorIdAsync(NotaFiscal notaFiscal, CancellationToken cancellationToken = default)
    {
        var oldNotaFiscal = await _context.NotaFiscal.FirstOrDefaultAsync(p => p.Id == notaFiscal.Id, cancellationToken);
        if (oldNotaFiscal == null) return null;
        oldNotaFiscal.Atualizar(notaFiscal.Ativo, notaFiscal.ItemNotaFiscal);
        await _context.SaveChangesAsync(cancellationToken);
        return oldNotaFiscal;
    }
}