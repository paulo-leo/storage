import Dir from './Dir.mjs';
import File from './File.mjs';

const storage = {};

storage.dir = (new Dir);
storage.file = (new File);


export default storage;