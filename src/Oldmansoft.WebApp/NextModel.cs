using System;
using System.Collections.Generic;
using System.Text;

namespace Oldmansoft.WebApp
{
    /// <summary>
    /// 下一页
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class NextModel<T>
    {
        /// <summary>
        /// 加载内容
        /// </summary>
        public string NextLoading { get; set; }

        /// <summary>
        /// 跳过数量
        /// </summary>
        public int Skip { get; set; }

        /// <summary>
        /// 列表
        /// </summary>
        public IList<T> List { get; set; }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="list"></param>
        /// <param name="areaName"></param>
        /// <param name="controllerName"></param>
        /// <param name="actionName"></param>
        /// <param name="skip"></param>
        /// <param name="length"></param>
        /// <param name="routeValues"></param>
        /// <returns></returns>
        public static NextModel<T> CreateNext(IList<T> list, string areaName, string controllerName, string actionName, int skip, int length, object routeValues = null)
        {
            var result = new NextModel<T>
            {
                List = list ?? throw new ArgumentNullException("list"),
                Skip = skip
            };
            if (result.List.Count == length)
            {
                var attach = new StringBuilder();
                if (routeValues != null)
                {
                    var type = routeValues.GetType();
                    foreach (var property in type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance))
                    {
                        var value = property.GetValue(routeValues);
                        if (value == null) continue;
                        attach.Append("&");
                        attach.Append(System.Web.HttpUtility.UrlPathEncode(property.Name));
                        attach.Append("=");
                        attach.Append(System.Web.HttpUtility.UrlPathEncode(value.ToString()));
                    }
                }
                if (string.IsNullOrWhiteSpace(areaName))
                {
                    result.NextLoading = string.Format("/{1}/{2}?skip={3}{4}", areaName, controllerName, actionName, result.List.Count + skip, attach.ToString()).GetWebAppLoadingContent();
                }
                else
                {
                    result.NextLoading = string.Format("/{0}/{1}/{2}?skip={3}{4}", areaName, controllerName, actionName, result.List.Count + skip, attach.ToString()).GetWebAppLoadingContent();
                }
            }
            return result;
        }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="list"></param>
        /// <param name="controllerName"></param>
        /// <param name="actionName"></param>
        /// <param name="skip"></param>
        /// <param name="length"></param>
        /// <param name="routeValues"></param>
        /// <returns></returns>
        public static NextModel<T> CreateNext(IList<T> list, string controllerName, string actionName, int skip, int length, object routeValues = null)
        {
            return CreateNext(list, null, controllerName, actionName, skip, length, routeValues);
        }
    }

    /// <summary>
    /// 下一页
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="A"></typeparam>
    public class NextModel<T, A>
    {
        /// <summary>
        /// 附加内容
        /// </summary>
        public A Attach { get; set; }

        /// <summary>
        /// 加载内容
        /// </summary>
        public string NextLoading { get; set; }

        /// <summary>
        /// 跳过数量
        /// </summary>
        public int Skip { get; set; }

        /// <summary>
        /// 列表
        /// </summary>
        public IList<T> List { get; set; }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="list"></param>
        /// <param name="areaName"></param>
        /// <param name="controllerName"></param>
        /// <param name="actionName"></param>
        /// <param name="skip"></param>
        /// <param name="length"></param>
        /// <param name="routeValues"></param>
        /// <returns></returns>
        public static NextModel<T, A> CreateNext(IList<T> list, string areaName, string controllerName, string actionName, int skip, int length, object routeValues = null)
        {
            var result = new NextModel<T, A>
            {
                List = list ?? throw new ArgumentNullException("list"),
                Skip = skip
            };
            if (result.List.Count == length)
            {
                var attach = new StringBuilder();
                if (routeValues != null)
                {
                    var type = routeValues.GetType();
                    foreach (var property in type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance))
                    {
                        var value = property.GetValue(routeValues);
                        if (value == null) continue;
                        attach.Append("&");
                        attach.Append(System.Web.HttpUtility.UrlPathEncode(property.Name));
                        attach.Append("=");
                        attach.Append(System.Web.HttpUtility.UrlPathEncode(value.ToString()));
                    }
                }
                if (string.IsNullOrWhiteSpace(areaName))
                {
                    result.NextLoading = string.Format("/{1}/{2}?skip={3}{4}", areaName, controllerName, actionName, result.List.Count + skip, attach.ToString()).GetWebAppLoadingContent();
                }
                else
                {
                    result.NextLoading = string.Format("/{0}/{1}/{2}?skip={3}{4}", areaName, controllerName, actionName, result.List.Count + skip, attach.ToString()).GetWebAppLoadingContent();
                }
            }
            return result;
        }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="list"></param>
        /// <param name="controllerName"></param>
        /// <param name="actionName"></param>
        /// <param name="skip"></param>
        /// <param name="length"></param>
        /// <param name="routeValues"></param>
        /// <returns></returns>
        public static NextModel<T, A> CreateNext(IList<T> list, string controllerName, string actionName, int skip, int length, object routeValues = null)
        {
            return CreateNext(list, null, controllerName, actionName, skip, length, routeValues);
        }
    }
}
