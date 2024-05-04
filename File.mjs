import path from 'path';
import { readFile, writeFile, unlink } from 'fs/promises';
import Dir from './Dir.mjs';
/**
 * Classe para manipulação de operações relacionadas ao sistema de arquivos.
 */

export default class File {
    /**
    * Lê o conteúdo de um arquivo.
    * @param {string} filePath O caminho do arquivo a ser lido.
    * @returns {Promise<object>} Uma promessa que resolve com um objeto contendo a propriedade "read" indicando se a leitura foi bem-sucedida, a propriedade "content" contendo o conteúdo do arquivo (se a leitura foi bem-sucedida) ou o erro (se a leitura falhou), e a propriedade "extension" contendo a extensão do arquivo.
    */
    async read(filePath) {
        try {
            const content = await readFile(filePath, 'utf-8');
            const extension = path.extname(filePath);
            const fileName = path.basename(filePath, extension);
            return {
                read: true,
                name: fileName,
                content: content,
                extension: extension,
                nameWithExtension: fileName + extension
            };
        } catch (err) {
            return {
                read: false,
                content: err
            };
        }
    }
    /**
   * Cria um novo arquivo com o conteúdo especificado.
   * @param {string} filePath O caminho do arquivo a ser criado.
   * @param {string} content O conteúdo a ser escrito no arquivo.
   * @returns {Promise<{ create: boolean, error?: Error }>} Uma promessa que resolve com um objeto contendo a propriedade "create" indicando se a criação do arquivo foi bem-sucedida e, opcionalmente, a propriedade "error" contendo o erro ocorrido, caso a criação do arquivo falhe.
   */
    async create(filePath, content) {
        try {
            await writeFile(filePath, content);
            return {
                create: true
            };
        } catch (err) {
            return {
                create: false,
                error: err
            }
        }
    }

    /**
    * Atualiza o conteúdo de um arquivo existente.
    * @param {string} filePath O caminho do arquivo a ser atualizado.
    * @param {string} content O novo conteúdo a ser escrito no arquivo.
    * @returns {Promise<{ updated: boolean, error?: Error }>} Uma promessa que resolve com um objeto contendo a propriedade "updated" indicando se a atualização do arquivo foi bem-sucedida e, opcionalmente, a propriedade "error" contendo o erro ocorrido, caso a atualização do arquivo falhe.
    */
    async update(filePath, content) {
        try {
            await writeFile(filePath, content);
            return { updated: true };
        } catch (err) {
            return { updated: false, error: err };
        }
    }

    /**
    * Apaga um arquivo existente.
    * @param {string} filePath O caminho do arquivo a ser apagado.
    * @returns {Promise<{ deleted: boolean, error?: Error }>} Uma promessa que resolve com um objeto contendo a propriedade "deleted" indicando se a exclusão do arquivo foi bem-sucedida e, opcionalmente, a propriedade "error" contendo o erro ocorrido, caso a exclusão do arquivo falhe.
    */
    async delete(filePath) {
        try {
            await unlink(filePath);
            return { deleted: true };
        } catch (err) {
            return { deleted: false, error: err };
        }
    }

    /**
    * Renomeia um arquivo.
    * @param {string} oldFile O caminho atual do arquivo.
    * @param {string} newFile O novo caminho para renomear o arquivo.
    * @returns {Promise<boolean>}  Uma promessa que resolve com um objeto contendo a propriedade "renamed" indicando se a renomeação do arquivo foi bem-sucedida e, opcionalmente, a propriedade "error" contendo o erro ocorrido, caso a renomeação do arquivo falhe.
    */
    async rename(oldFile, newFile) {
        try {
            const dir = new Dir;

            if (await dir.check(oldFile))
                throw new Error('It is not a valid file.');

            await dir.rename(oldFile, newFile);
            return { renamed: true };
        } catch (err) {
            return { renamed: false, error: err };
        }
    }

    async copy(oldFilePath, newFilePath) {
        try {

            let file = await this.read(oldFilePath);

            if (file.read) {
                await this.create(newFilePath, file.content);
                return true;
            }

        } catch (error) {
            return false;
        }
    }
}

