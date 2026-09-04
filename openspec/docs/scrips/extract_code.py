import os
import re

def analyze_java_file(filepath, base_path):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract class/interface/enum name
    class_match = re.search(r'(?:public|protected|private|abstract|class|interface|enum|record)\s+(?:class|interface|enum|record)?\s+([A-Za-z0-9_]+)', content)
    entity_name = class_match.group(1) if class_match else os.path.basename(filepath).replace('.java', '')

    # Extract package
    pkg_match = re.search(r'package\s+([a-zA-Z0-9_\.]+);', content)
    pkg = pkg_match.group(1) if pkg_match else "Desconocido"

    # Extract imports (dependencies)
    imports = re.findall(r'import\s+([\w\.]+);', content)
    connections = "\n".join([f"- {imp}" for imp in imports]) if imports else "Ninguna"

    # Try to extract class level javadoc / comments for "qué hace"
    javadoc_match = re.search(r'/\*\*(.*?)\*/\s*(?:@[A-Za-z0-9_]+\s*)*(?:public|protected|private|abstract|class|interface|enum)', content, re.DOTALL)
    description = javadoc_match.group(1).strip() if javadoc_match else ""
    
    # Infer purpose based on annotations or name
    inferred_purpose = []
    if '@Entity' in content: inferred_purpose.append("Es una entidad de Base de Datos (JPA).")
    if '@RestController' in content or '@Controller' in content: inferred_purpose.append("Es un Controlador (API REST) que expone endpoints.")
    if '@Service' in content: inferred_purpose.append("Es un Servicio que contiene lógica de negocio.")
    if '@Repository' in content or 'extends JpaRepository' in content: inferred_purpose.append("Es un Repositorio para acceso a base de datos.")
    if '@Configuration' in content: inferred_purpose.append("Es una clase de Configuración de Spring.")
    if '@Component' in content: inferred_purpose.append("Es un Componente administrado por Spring.")
    if '@Test' in content or 'Test' in entity_name: inferred_purpose.append("Es una clase de Pruebas (Tests).")
    if 'record ' in content or 'DTO' in entity_name: inferred_purpose.append("Es un DTO (Data Transfer Object) para transportar datos.")
    if 'Exception' in entity_name: inferred_purpose.append("Es una clase de Excepción personalizada.")
    
    if not description:
        description = " ".join(inferred_purpose) if inferred_purpose else "Clase auxiliar o modelo de dominio."

    # Extract class fields (arguments/parameters)
    fields = re.findall(r'(?:private|protected|public)\s+(?:final\s+)?([A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)\s*(?:=|;)', content)
    params = "\n".join([f"- {ftype} {fname}" for ftype, fname in fields]) if fields else "Sin campos definidos."

    # Format the output report
    report = f"""==================================================
DOCUMENTACIÓN DE ENTIDAD / CLASE
==================================================

1. RUTA (PACKAGE):
{pkg}
(Ruta física: {filepath.replace(base_path, '')})

2. ENTIDAD / CLASE:
{entity_name}

3. ¿QUÉ HACE Y PARA QUÉ SIRVE?
{description}

4. ¿CON QUÉ ESTÁ CONECTADA? (DEPENDENCIAS / IMPORTS):
{connections}

5. ARGUMENTOS O PARÁMETROS (CAMPOS):
{params}

6. CÓDIGO COMPLETO:
==================================================
{content}
==================================================

"""
    return report

def main():
    base_dirs = [
        '/home/ivan/Desktop/Proyectos/LaTab/LabTab-Ivan/LabTab-Back/src/main/java',
        '/home/ivan/Desktop/Proyectos/LaTab/LabTab-Ivan/LabTab-Back/src/test/java'
    ]
    output_dir = '/home/ivan/Desktop/Proyectos/LaTab/LabTab-Ivan/openspec/docs/codigo-txt'
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    output_file_path = os.path.join(output_dir, 'codigo_completo_backend.txt')
    
    with open(output_file_path, 'w', encoding='utf-8') as out_f:
        out_f.write("REPORTE COMPLETO DE CÓDIGO DEL BACKEND DE LABTAB (MAIN Y TESTS)\n")
        out_f.write("=" * 50 + "\n\n")
        
        for back_dir in base_dirs:
            if os.path.exists(back_dir):
                for root, dirs, files in os.walk(back_dir):
                    for file in files:
                        if file.endswith('.java'):
                            filepath = os.path.join(root, file)
                            try:
                                report = analyze_java_file(filepath, back_dir)
                                out_f.write(report)
                                rel_path = os.path.relpath(filepath, back_dir)
                                print(f"Respaldado: {rel_path} (de {os.path.basename(os.path.dirname(os.path.dirname(back_dir)))})")
                            except Exception as e:
                                print(f"Error procesando {filepath}: {e}")
            else:
                print(f"Ruta no encontrada, ignorando: {back_dir}")
                        
    print(f"\n¡Extracción completada! Todo el código (main y test) se encuentra en: {output_file_path}")

if __name__ == '__main__':
    main()
