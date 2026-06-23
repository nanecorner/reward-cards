'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Client = {
  id: string
  name: string
  phone: string | null
  current_visits: number
  created_at: string
}

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')

  const term = search.toLowerCase()
  const rows =
    term === ''
      ? clients
      : clients.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            (c.phone || '').toLowerCase().includes(term)
        )

  return (
    <>
      <input
        type="text"
        placeholder="Buscar por nombre o teléfono..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-sm">
              <th className="pb-4 font-medium pl-4">Nombre</th>
              <th className="pb-4 font-medium">Teléfono</th>
              <th className="pb-4 font-medium">Visitas</th>
              <th className="pb-4 font-medium">Registro</th>
              <th className="pb-4 font-medium text-right pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500">
                  {term ? `Sin resultados para "${search}"` : 'No hay clientes aún.'}
                </td>
              </tr>
            ) : (
              rows.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="py-4 pl-4 font-medium text-white">{client.name}</td>
                  <td className="py-4 text-zinc-400">{client.phone || '-'}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                      {client.current_visits}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-500 text-sm" suppressHydrationWarning>
                    {new Date(client.created_at).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
