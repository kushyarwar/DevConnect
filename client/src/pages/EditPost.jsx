import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updatePost } from '../features/posts/postsSlice'; 
import api from '../api/axios'; 
import toast from 'react-hot-toast';
import { HiOutlineCode, HiOutlinePhotograph, HiX, HiArrowLeft } from 'react-icons/hi';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState({ language: 'javascript', code: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        const post = data.post;
        
        setContent(post.content);
        if (post.codeSnippet) setCodeSnippet(post.codeSnippet);
        if (post.image) setPreview(post.image.url);
        
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load post');
        navigate('/');
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    formData.append('content', content);
    
    // Always send code snippet (even if empty)
    formData.append('codeSnippet[language]', codeSnippet.language);
    formData.append('codeSnippet[code]', codeSnippet.code);
    
    if (image) {
      formData.append('image', image);
    } 

    else if (removeImage) {
      formData.append('deleteImage', 'true');
    }

    try {
      await dispatch(updatePost({ id, formData })).unwrap();
      toast.success('Post updated successfully!');
      navigate('/'); 
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false); 
    }
  };

  const handleRemoveImage = () => {
      setImage(null);
      setPreview(null);
      setRemoveImage(true);
  };

  if (loading) return <div className="p-10 text-center text-dark-300">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <HiArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">Edit Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-900 p-4 rounded-xl border border-dark-800">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-dark-100 placeholder-dark-500 resize-none focus:outline-none min-h-[150px]"
            placeholder="What's on your mind?"
          />
        
          {preview && (
            <div className="relative mt-4 mb-2">
              <img src={preview} alt="Preview" className="rounded-lg max-h-60 object-cover w-full border border-dark-700" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full text-white hover:bg-red-500 transition"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-800">
            <label className="cursor-pointer text-primary-400 hover:text-primary-300 transition flex items-center gap-2">
              <HiOutlinePhotograph className="w-5 h-5" />
              <span className="text-sm font-medium">Change Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div className="bg-dark-900 p-4 rounded-xl border border-dark-800">
          <div className="flex items-center gap-2 mb-3 text-dark-300">
            <HiOutlineCode className="w-5 h-5" />
            <span className="text-sm font-medium">Code Snippet</span>
          </div>
          <select
            value={codeSnippet.language}
            onChange={(e) => setCodeSnippet({ ...codeSnippet, language: e.target.value })}
            className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm mb-3 focus:outline-none focus:border-primary-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <textarea
            value={codeSnippet.code}
            onChange={(e) => setCodeSnippet({ ...codeSnippet, code: e.target.value })}
            placeholder="Paste your code here..."
            className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 text-dark-100 font-mono text-sm h-32 focus:outline-none focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditPost;