import React, { useState } from 'react';
import { LogEntry } from '../types/neon';
import { Terminal, Filter, Trash2, Download, Search, Check } from 'lucide-react';

interface LogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
    if (selectedLevel !== 'ALL' && log.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchCtx = log.context.toLowerCase().includes(q);
      if (!matchMsg && !matchCtx) return false;
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toISOString()}] [${l.category}] [${l.level}] (${l.context}): ${l.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header and Filters */}
      <div className="bg-[#0b1422] border border-[#1d2d42] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#182a40] pb-3">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-[#00f2fe]" />
            <h3 className="text-sm font-bold text-white tracking-wider">
              REGISTRO DE DIAGNÓSTICO & LOGS DE EXECUÇÃO
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#102338] text-[#86aee0]">
              {filteredLogs.length} logs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#112236] hover:bg-[#1a3452] border border-[#234366] text-[#9fc7f2] text-xs transition-all cursor-pointer"
            >
              {copied ? <Check size={12} className="text-[#67c23a]" /> : <Download size={12} />}
              <span>{copied ? 'Copiado!' : 'Exportar Logs'}</span>
            </button>

            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#112236] hover:bg-[#331111] border border-[#234366] hover:border-[#f56c6c] text-[#f56c6c] text-xs transition-all cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[10px] text-[#718dae] mb-1">Categoria:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg px-2.5 py-1.5 text-xs text-[#d2e4f7] outline-none"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="INITIALIZATION">INITIALIZATION</option>
              <option value="COMPATIBILITY">COMPATIBILITY</option>
              <option value="EVENT">EVENT</option>
              <option value="DECISION">DECISION</option>
              <option value="PERSISTENCE">PERSISTENCE</option>
              <option value="ERROR">ERROR</option>
              <option value="PERFORMANCE">PERFORMANCE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[#718dae] mb-1">Nível de Severidade:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg px-2.5 py-1.5 text-xs text-[#d2e4f7] outline-none"
            >
              <option value="ALL">Todos os Níveis</option>
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[#718dae] mb-1">Busca Textual:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar mensagem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e192a] border border-[#21354e] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-[#d2e4f7] outline-none"
              />
              <Search size={12} className="absolute left-2.5 top-2.5 text-[#5e7896]" />
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="bg-[#070d18] border border-[#16253a] rounded-xl p-3.5 max-h-[500px] overflow-y-auto space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#526a85] italic">
            Nenhum log encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString('pt-BR', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            const levelColor =
              log.level === 'ERROR'
                ? 'text-[#f56c6c] bg-[#331111]'
                : log.level === 'WARN'
                ? 'text-[#e6a23c] bg-[#2d220a]'
                : log.level === 'DEBUG'
                ? 'text-[#85a0be] bg-[#102030]'
                : 'text-[#00f2fe] bg-[#0c2438]';

            return (
              <div
                key={log.id}
                className="flex items-start gap-2 text-[11px] font-mono leading-relaxed hover:bg-[#0c1626] p-1 rounded transition-colors"
              >
                <span className="text-[#556d87] shrink-0">{timeStr}</span>
                <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${levelColor}`}>
                  {log.level}
                </span>
                <span className="text-[#7ea0c7] shrink-0">[{log.category}]</span>
                <span className="text-[#8e7aab] shrink-0">({log.context}):</span>
                <span className="text-[#d8e8f8] break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
