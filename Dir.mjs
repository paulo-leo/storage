import path from 'path';
import { access, mkdir, rename, rm, readdir, stat } from 'fs/promises';
import File from './File.mjs';

/**
 * Classe para manipulação de operações relacionadas ao sistema de arquivos.
 */
export default class Dir {
    /**
     * Verifica se o diretório ou arquivo especificado existe.
     * @param {string} dirName O caminho do diretório ou arquivo a ser verificado.
     * @returns  {Promise<boolean>} um valor booleano indicando que existe o diretório ou arquivo.
     */
    async exists(dirName) {
        try {
            await access(dirName);
            return true
        } catch (err) {
            return false;
        }
    }

    /**
     * Cria um diretório com o nome especificado.
     * @param {string} dirName O nome do diretório a ser criado.
     * @returns {Promise<boolean>} Um valor booleano indicando se a criação do diretório foi bem-sucedida.
     */
    async create(dirName) {
        try {
            await mkdir(dirName);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Renomeia um diretório ou arquivo.
     * @param {string} oldDir O caminho atual do diretório ou arquivo.
     * @param {string} newDir O novo caminho para renomear o diretório ou arquivo.
     * @returns {Promise<boolean>} Um valor booleano indicando se a renomeação do diretório/arquivo foi bem-sucedida.
     */
    async rename(oldDir, newDir) {
        try {
            await rename(oldDir, newDir);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Exclui um diretório.
     * @param {string} folderPath O caminho do diretório a ser excluído.
     * @returns {Promise<boolean>} Um valor booleano indicando se a exclusão do diretório foi bem-sucedida.
     */
    async delete(folderPath) {
        try {
            await rm(folderPath, { recursive: true });
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
   * Verifica se o caminho especificado é um diretório.
   * @param {string} path O caminho a ser verificado.
   * @returns {Promise<boolean>} Um valor booleano indicando se o caminho se refere a um diretório.
   */
    async check(path) {
        try {
            const stats = await stat(path);
            return stats.isDirectory();
        } catch (err) {
            return false;
        }
    }

    /**
   * Lista todo o conteúdo de um diretório, incluindo sub-diretórios de forma opcional.
   * @param {string} dirPath O caminho do diretório a ser listado.
   * @param {boolean} listSubPath Define se deve listar sub-diretórios de forma recursiva (opcional).
   * @returns {Promise<Object[]>} Uma lista de objetos representando os itens encontrados dentro do diretório especificado. Cada objeto contém os seguintes campos:
   *  - path: O caminho completo do item.
   *  - file: Um booleano indicando se é um arquivo (true) ou diretório (false).
   *  - name: O nome do item.
   *  - (Se for um arquivo) extension: A extensão do arquivo.
   *  - (Se for um arquivo) nameWithExtension: O nome do arquivo com extensão.
   *  - (Se for um diretório e listSubPath for true) sub: Uma array de objetos representando o conteúdo do sub-diretório, seguindo a mesma estrutura descrita aqui de forma recursiva.
   */
    async list(dirPath, listSubPath = false) {
        try {
            const items = await readdir(dirPath);
            let contents = [];
            for (let index in items) {
                let item = items[index];
                let filePath = `${dirPath}/${item}`;
                let isDir = await this.check(filePath);
                let info = {};

                info['path'] = filePath;
                info['file'] = !isDir;

                const fileNameWithExtension = path.basename(filePath);
                const fileName = path.parse(filePath).name;
                const fileExtension = path.extname(filePath);

                info['name'] = fileName;
                if (!isDir) {
                    info['extension'] = fileExtension,
                        info['nameWithExtension'] = fileNameWithExtension;
                }

                if (listSubPath && isDir) {
                    info['sub'] = await this.list(filePath, true);
                };
                contents.push(info);
            }
            return contents;
        } catch (err) {
            return [];
        }
    }

    async lastName(baseName, extension = '') {
        let count = 0;
        let find = true;

        do {
            let findName = (count > 1) ?
                `${baseName}-copy-${count}${extension}`
                : `${baseName}-copy${extension}`;

            let exists = await this.exists(findName);
            if (!exists) {
                find = false;
                return findName;
            }
            count++;
        } while (find);
    }

    async copy(ofPath, toPath) {

        if (!toPath) {
            toPath = await this.lastName(ofPath);
        }

        let fileClass = new File;

        if (!(await this.exists(toPath))) {
            await this.create(toPath);
        }

        let copies = await this.list(ofPath);
        

        for (let item of copies) {
            let file = item.file;
            let before = item.path;
            let after = before.replace(new RegExp(ofPath, 'g'), toPath);

            if (!file) {
                await this.copy(before, after)
            } else {
                await fileClass.copy(before, after);
            }
        }
        return true;
    }

    async move(ofPath, toPath) {
        await this.copy(ofPath, toPath);
        await this.delete(ofPath);
    }

}
