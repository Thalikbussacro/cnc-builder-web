"use client";

import { ProjectsList } from './ProjectsList';

export function ProjectsSection() {
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Meus Projetos</h2>
          <p className="text-muted-foreground">
            Carregue um projeto salvo anteriormente para continuar trabalhando nele.
          </p>
        </div>

        <ProjectsList />
      </div>
    </div>
  );
}
