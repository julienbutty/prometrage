import { prisma } from "@/lib/prisma";

/**
 * Find existing client by email or create new client
 * @param data Client information from AI parsing
 * @returns Client object and isNew flag
 */
export async function findOrCreateClient(data: {
  nom: string;
  email?: string | null;
  tel?: string | null;
}): Promise<{ client: { id: string; nom: string; email: string | null; tel: string | null }; isNew: boolean }> {
  // If email is provided, search for existing client
  if (data.email) {
    const existing = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      // Client found - optionally update tel if different
      if (data.tel && existing.tel !== data.tel) {
        const updated = await prisma.client.update({
          where: { id: existing.id },
          data: { tel: data.tel },
        });
        return { client: updated, isNew: false };
      }
      return { client: existing, isNew: false };
    }
  }

  // Client not found or no email - create new
  const newClient = await prisma.client.create({
    data: {
      nom: data.nom,
      email: data.email || null,
      tel: data.tel || null,
    },
  });

  return { client: newClient, isNew: true };
}
