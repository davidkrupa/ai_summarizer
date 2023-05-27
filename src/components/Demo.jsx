import { useState, useEffect } from "react";

import {
  copy,
  linkIcon,
  loader,
  tick,
  chevron,
  chevronUp,
  remove,
} from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [openSummary, setOpenSummary] = useState(null);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);

      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpen = (chosen) => {
    if (chosen === openSummary) {
      setOpenSummary(null);
    } else {
      setOpenSummary(chosen);
    }
  };

  const handleRemove = (removeUrl) => {
    const afterRemove = allArticles.filter(
      (article) => article.url !== removeUrl
    );
    setAllArticles(afterRemove);
    localStorage.removeItem("articles");
    localStorage.setItem("articles", JSON.stringify(afterRemove));
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />

          <input
            type="url"
            name="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer"
          />

          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            ↵
          </button>
        </form>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((item, index) => (
            <div key={`article-${index}`}>
              <div
                onClick={() => handleOpen(item.url)}
                className="link_card cursor-pointer"
              >
                <div className="copy_btn " onClick={() => handleCopy(item.url)}>
                  <img
                    src={copied === item.url ? tick : copy}
                    alt="copy_icon"
                    className="w-[50%] h-[50%] object-contain"
                  />
                </div>
                <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                  {item.url}
                </p>
                <div className="copy_btn" onClick={() => handleOpen(item.url)}>
                  <img
                    src={openSummary === item.url ? chevronUp : chevron}
                    alt="show_more_icon"
                    className="w-[60%] h-[60%] object-contain"
                  />
                </div>
                <div
                  className="copy_btn"
                  onClick={() => handleRemove(item.url)}
                >
                  <img
                    src={remove}
                    alt="show_more_icon"
                    className="w-[60%] h-[60%] object-contain"
                  />
                </div>
              </div>
              {openSummary === item.url && (
                <div className="flex flex-col gap-3 mt-5 ">
                  <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                    Article <span className="blue_gradient">Summary</span>
                  </h2>
                  <div
                    className="summary_box cursor-pointer"
                    onClick={() => handleCopy(item.summary)}
                  >
                    <div className="copy_btn">
                      <img
                        src={copied === item.summary ? tick : copy}
                        alt="copy_icon"
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                    <p className="font-inter font-medium text-sm text-gray-700 mt-3">
                      {item.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
