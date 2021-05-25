namespace Oldmansoft.WebApp
{
    /// <summary>
    /// 动作模型
    /// </summary>
    public class ActionModel
    {
        /// <summary>
        /// 提示信息
        /// </summary>
        public string Text { get; private set; }

        /// <summary>
        /// 重定向地址
        /// </summary>
        public string Path { get; private set; }

        /// <summary>
        /// 是否刷新
        /// </summary>
        public bool Renew { get; private set; }

        /// <summary>
        /// 是否关闭
        /// </summary>
        public bool Off { get; private set; }

        /// <summary>
        /// 自定义数据
        /// </summary>
        public object Data { get; private set; }

        private ActionModel() { }

        /// <summary>
        /// 提示
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ActionModel Alert(string message)
        {
            return new ActionModel
            {
                Text = message
            };
        }

        /// <summary>
        /// 重定向
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        public static ActionModel Redirect(string url)
        {
            return new ActionModel
            {
                Path = url
            };
        }

        /// <summary>
        /// 重定向
        /// </summary>
        /// <param name="url"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ActionModel Redirect(string url, string message)
        {
            return new ActionModel
            {
                Text = message,
                Path = url
            };
        }

        /// <summary>
        /// 刷新
        /// </summary>
        /// <returns></returns>
        public static ActionModel Reload()
        {
            return new ActionModel
            {
                Renew = true
            };
        }

        /// <summary>
        /// 刷新
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ActionModel Reload(string message)
        {
            return new ActionModel
            {
                Text = message,
                Renew = true
            };
        }

        /// <summary>
        /// 关闭
        /// </summary>
        /// <returns></returns>
        public static ActionModel Close()
        {
            return new ActionModel
            {
                Off = true
            };
        }

        /// <summary>
        /// 关闭
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ActionModel Close(string message)
        {
            return new ActionModel
            {
                Text = message,
                Off = true
            };
        }

        /// <summary>
        /// 关闭并重载
        /// </summary>
        /// <returns></returns>
        public static ActionModel CloseAndReload()
        {
            return new ActionModel
            {
                Off = true,
                Renew = true
            };
        }

        /// <summary>
        /// 关闭并重载
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ActionModel CloseAndReload(string message)
        {
            return new ActionModel
            {
                Text = message,
                Off = true,
                Renew = true
            };
        }

        /// <summary>
        /// 自定义数据
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public static ActionModel Custom(object data)
        {
            return new ActionModel
            {
                Data = data
            };
        }
    }
}
