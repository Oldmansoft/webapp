using System;
using System.Collections.Generic;
using System.Text;

namespace Oldmansoft.WebApp
{
    static class Extend
    {
        /// <summary>
        /// 获取加载内容
        /// </summary>
        /// <param name="source"></param>
        /// <returns></returns>
        public static string GetWebAppLoadingContent(this string source)
        {
            return string.Format("<div class='webapp-loading' data-src='{0}'>加载中...</div>", source);
        }
    }
}
